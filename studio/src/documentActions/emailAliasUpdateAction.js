import React from "react";
import { SyncIcon } from "@sanity/icons";
import { Spinner, useToast } from "@sanity/ui";
import { useClient } from "sanity";

const webhookUrl =
  process.env.SANITY_STUDIO_EMAIL_ALIAS_SYNC_WEBHOOK_URL ||
  process.env.VITE_EMAIL_ALIAS_SYNC_WEBHOOK_URL ||
  "";

const webhookToken =
  process.env.SANITY_STUDIO_EMAIL_ALIAS_SYNC_WEBHOOK_TOKEN ||
  process.env.VITE_EMAIL_ALIAS_SYNC_WEBHOOK_TOKEN ||
  "";

const API_VERSION = "2024-06-01";

const normalizeDocumentId = (value) =>
  String(value || "")
    .trim()
    .replace(/^drafts\./, "");

const normalizeAlias = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeTypeReference = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }

  return normalizeDocumentId(value?._ref).toLowerCase();
};

const normalizeRecipients = (value) =>
  (Array.isArray(value) ? value : [])
    .map((entry) => {
      const entryType = String(entry?._type || "").trim();

      if (entryType === "emailAliasAddressRecipient") {
        const email = String(entry?.email || "").trim().toLowerCase();
        return email ? `email:${email}` : "";
      }

      if (entryType === "emailAliasReferenceRecipient") {
        const aliasRef = String(entry?.alias?._ref || "")
          .trim()
          .replace(/^drafts\./, "")
          .toLowerCase();
        return aliasRef ? `alias:${aliasRef}` : "";
      }

      return "";
    })
    .filter(Boolean);

const getSchemaTypeName = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value.name === "string") return value.name;
  return "";
};

const omitSystemFields = (documentValue) => {
  if (!documentValue || typeof documentValue !== "object") return documentValue;

  const {
    _createdAt,
    _updatedAt,
    _rev,
    ...rest
  } = documentValue;

  return rest;
};

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const buildAliasSnapshot = (documentValue) => ({
  name: normalizeAlias(documentValue?.name),
  enabled: documentValue?.enabled !== false,
  type: normalizeTypeReference(documentValue?.type),
  recipients: normalizeRecipients(documentValue?.recipients),
});

const snapshotsMatch = (left, right) => {
  if (left.name !== right.name) return false;
  if (left.enabled !== right.enabled) return false;
  if (left.type !== right.type) return false;
  if (left.recipients.length !== right.recipients.length) return false;
  return left.recipients.every((value, index) => value === right.recipients[index]);
};

const waitForPublishedAliasDocument = async ({
  client,
  documentId,
  expectedSnapshot,
  maxAttempts = 30,
  intervalMs = 1000,
}) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const publishedDoc = await client.fetch(
      '*[_id == $id][0]{name, enabled, type, recipients}',
      { id: documentId },
    );
    if (snapshotsMatch(buildAliasSnapshot(publishedDoc), expectedSnapshot)) {
      return publishedDoc;
    }
    await sleep(intervalMs);
  }

  throw new Error(
    "Timed out waiting for the published alias document to match the latest changes.",
  );
};

const fetchAliasSnapshots = async (client, documentId) => {
  const publishedId = normalizeDocumentId(documentId);
  const draftId = `drafts.${publishedId}`;

  return client.fetch(
    '{"published": *[_id == $publishedId][0], "draft": *[_id == $draftId][0]}',
    { publishedId, draftId },
  );
};

const getReferencedAliasIds = (documentValue) =>
  (Array.isArray(documentValue?.recipients) ? documentValue.recipients : [])
    .map((entry) => {
      const entryType = String(entry?._type || "").trim();
      if (entryType !== "emailAliasReferenceRecipient") return "";
      return normalizeDocumentId(entry?.alias?._ref);
    })
    .filter(Boolean);

const publishAliasDraftByMutation = async ({
  client,
  documentId,
}) => {
  const publishedId = normalizeDocumentId(documentId);
  const draftId = `drafts.${publishedId}`;
  const snapshots = await fetchAliasSnapshots(client, publishedId);
  const draftDocument = snapshots?.draft;

  if (!draftDocument) {
    return snapshots?.published || null;
  }

  const nextPublishedDocument = {
    ...omitSystemFields(draftDocument),
    _id: publishedId,
  };

  await client
    .transaction()
    .createOrReplace(nextPublishedDocument)
    .delete(draftId)
    .commit();

  return client.fetch('*[_id == $id][0]', { id: publishedId });
};

const publishCurrentAliasFromState = async ({
  client,
  documentId,
  documentValue,
}) => {
  const publishedId = normalizeDocumentId(documentId);
  const draftId = `drafts.${publishedId}`;

  const nextDraftDocument = {
    ...omitSystemFields(documentValue),
    _id: draftId,
  };

  const nextPublishedDocument = {
    ...omitSystemFields(documentValue),
    _id: publishedId,
  };

  await client
    .transaction()
    .createOrReplace(nextDraftDocument)
    .createOrReplace(nextPublishedDocument)
    .delete(draftId)
    .commit();

  return client.fetch('*[_id == $id][0]', { id: publishedId });
};

const publishAliasDependencies = async ({
  client,
  documentId,
  stack = [],
  visited = new Set(),
}) => {
  const resolvedDocumentId = normalizeDocumentId(documentId);
  if (!resolvedDocumentId) return;

  if (stack.includes(resolvedDocumentId)) {
    throw new Error(
      `Circular alias dependency detected: ${[...stack, resolvedDocumentId].join(" -> ")}`,
    );
  }

  if (visited.has(resolvedDocumentId)) {
    return;
  }

  const snapshots = await fetchAliasSnapshots(client, resolvedDocumentId);
  const currentDocument = snapshots?.draft || snapshots?.published;
  if (!currentDocument) {
    throw new Error(`Referenced alias "${resolvedDocumentId}" was not found.`);
  }

  const nextStack = [...stack, resolvedDocumentId];
  const referencedAliasIds = getReferencedAliasIds(currentDocument);

  for (const referencedAliasId of referencedAliasIds) {
    await publishAliasDependencies({
      client,
      documentId: referencedAliasId,
      stack: nextStack,
      visited,
    });
  }

  if (snapshots?.draft) {
    await publishAliasDraftByMutation({
      client,
      documentId: resolvedDocumentId,
    });
  }

  visited.add(resolvedDocumentId);
};

const SyncingIcon = () =>
  React.createElement("span", {
    style: {
      width: "1em",
      height: "1em",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
  }, React.createElement(Spinner, {
    muted: true,
    size: 1,
  }));

export function UpdateEmailAliasAction(props) {
  const { type, schemaType, draft, published, id, documentId, onComplete } = props;
  const toast = useToast();
  const client = useClient({ apiVersion: API_VERSION });
  const [isUpdating, setIsUpdating] = React.useState(false);

  const schemaTypeName = getSchemaTypeName(type) || getSchemaTypeName(schemaType);
  if (schemaTypeName !== "emailAlias") return null;

  const resolvedDocumentId = normalizeDocumentId(
    draft?._id || published?._id || id || documentId,
  );
  const currentDocument = draft || published || {};

  const handleComplete = () => {
    if (typeof onComplete === "function") onComplete();
  };

  const updateAlias = async () => {
    if (!webhookUrl) {
      toast.push({
        status: "error",
        title: "Email alias sync webhook is not configured",
        description:
          "Set SANITY_STUDIO_EMAIL_ALIAS_SYNC_WEBHOOK_URL to enable this action.",
      });
      handleComplete();
      return;
    }

    const targetSnapshot = buildAliasSnapshot(currentDocument);
    if (!targetSnapshot.name || targetSnapshot.recipients.length === 0) {
      toast.push({
        status: "error",
        title: "Alias is incomplete",
        description: "Provide an alias name and at least one recipient before updating.",
      });
      handleComplete();
      return;
    }

    setIsUpdating(true);
    try {
      const referencedAliasIds = getReferencedAliasIds(currentDocument);
      const visited = new Set();

      for (const referencedAliasId of referencedAliasIds) {
        await publishAliasDependencies({
          client,
          documentId: referencedAliasId,
          visited,
        });
      }

      const publishedSnapshot = buildAliasSnapshot(published);
      const needsPublish = Boolean(draft?._id) && !snapshotsMatch(publishedSnapshot, targetSnapshot);

      if (needsPublish) {
        await publishCurrentAliasFromState({
          client,
          documentId: resolvedDocumentId,
          documentValue: currentDocument,
        });
        await waitForPublishedAliasDocument({
          client,
          documentId: resolvedDocumentId,
          expectedSnapshot: targetSnapshot,
        });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(webhookUrl, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          ...(webhookToken
            ? { "x-email-alias-sync-token": webhookToken }
            : {}),
        },
        signal: controller.signal,
        body: JSON.stringify({
          operation: "email_alias_sync",
          trigger: {
            source: "sanity_email_alias_action",
            documentId: resolvedDocumentId,
          },
        }),
      });
      clearTimeout(timeout);

      const rawText = await response.text();
      let payload = {};
      try {
        payload = rawText ? JSON.parse(rawText) : {};
      } catch (_error) {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            `Webhook returned ${response.status}: ${rawText.slice(0, 220)}`,
        );
      }

      const upserted = Number(payload?.writes?.upserted || 0);
      const deleted = Number(payload?.writes?.deleted || 0);
      const unchanged = Number(payload?.writes?.unchanged || 0);

      toast.push({
        status: "success",
        title: "Email aliases updated",
        description: `${upserted} upserted, ${deleted} deleted, ${unchanged} unchanged.`,
      });
    } catch (error) {
      const networkHint =
        error instanceof TypeError ||
        (error instanceof Error && error.name === "AbortError")
          ? `Network request failed. URL=${webhookUrl}`
          : null;
      toast.push({
        status: "error",
        title: "Failed to update email aliases",
        description:
          networkHint ||
          (error instanceof Error
            ? error.message
            : "Unexpected error while updating email aliases."),
      });
    } finally {
      setIsUpdating(false);
      handleComplete();
    }
  };

  return {
    label: isUpdating ? "Updating..." : "Update",
    title: webhookUrl
      ? "Publish this alias if needed, then sync all published aliases to AWS."
      : "Configure SANITY_STUDIO_EMAIL_ALIAS_SYNC_WEBHOOK_URL to enable this action.",
    icon: isUpdating ? SyncingIcon : SyncIcon,
    disabled: isUpdating,
    onHandle: updateAlias,
  };
}
