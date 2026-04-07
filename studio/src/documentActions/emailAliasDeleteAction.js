import React from "react";
import { Spinner, useToast } from "@sanity/ui";
import { TrashIcon } from "@sanity/icons";
import { useClient, useDocumentOperation } from "sanity";

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

const getSchemaTypeName = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value.name === "string") return value.name;
  return "";
};

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const waitForDocumentDeletion = async ({
  client,
  documentId,
  maxAttempts = 30,
  intervalMs = 1000,
}) => {
  const publishedId = normalizeDocumentId(documentId);
  const draftId = `drafts.${publishedId}`;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const rows = await client.fetch(
      '*[_id in [$draftId, $publishedId]]{_id}',
      { draftId, publishedId },
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return true;
    }

    await sleep(intervalMs);
  }

  throw new Error(
    "Timed out waiting for the alias document to be deleted from Sanity.",
  );
};

const triggerEmailAliasSync = async (documentId) => {
  if (!webhookUrl) {
    throw new Error(
      "Set SANITY_STUDIO_EMAIL_ALIAS_SYNC_WEBHOOK_URL to enable alias sync after delete.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
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
          source: "sanity_email_alias_delete_action",
          documentId: normalizeDocumentId(documentId),
        },
      }),
    });

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

    return payload;
  } finally {
    clearTimeout(timeout);
  }
};

const DeletingIcon = () =>
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

export function DeleteEmailAliasAction(props) {
  const { type, schemaType, draft, published, id, documentId, onComplete } = props;
  const toast = useToast();
  const client = useClient({ apiVersion: API_VERSION });
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const schemaTypeName = getSchemaTypeName(type) || getSchemaTypeName(schemaType);
  const resolvedDocumentId = normalizeDocumentId(
    draft?._id || published?._id || id || documentId,
  );
  const ops = useDocumentOperation(resolvedDocumentId || "placeholder", schemaTypeName || "emailAlias");

  if (schemaTypeName !== "emailAlias") return null;
  if (!published?._id) return null;

  const isDisabled = ops?.delete?.disabled || isDeleting;

  const handleComplete = () => {
    if (typeof onComplete === "function") onComplete();
  };

  const onHandle = async () => {
    if (isDisabled) {
      handleComplete();
      return;
    }

    if (!showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    setShowConfirmDialog(false);
    setIsDeleting(true);

    try {
      ops.delete.execute();

      await waitForDocumentDeletion({
        client,
        documentId: resolvedDocumentId,
      });

      const payload = await triggerEmailAliasSync(resolvedDocumentId);

      // Final verification: ensure the document is still gone from Sanity before completing.
      await waitForDocumentDeletion({
        client,
        documentId: resolvedDocumentId,
        maxAttempts: 3,
        intervalMs: 250,
      });

      const deleted = Number(payload?.writes?.deleted || 0);
      const upserted = Number(payload?.writes?.upserted || 0);

      toast.push({
        status: "success",
        title: "Alias deleted",
        description: `Removed from Sanity and synced to AWS. ${deleted} DynamoDB rows deleted, ${upserted} updated.`,
      });
    } catch (error) {
      const networkHint =
        error instanceof TypeError ||
        (error instanceof Error && error.name === "AbortError")
          ? `Network request failed. URL=${webhookUrl}`
          : null;

      toast.push({
        status: "error",
        title: "Alias delete sync failed",
        description:
          networkHint ||
          (error instanceof Error
            ? error.message
            : "Unexpected error while deleting alias."),
      });
    } finally {
      setIsDeleting(false);
      handleComplete();
    }
  };

  return {
    dialog: showConfirmDialog && {
      type: "confirm",
      message: React.createElement(
        "div",
        null,
        "Delete this alias from Sanity and sync the removal to AWS?",
      ),
      onConfirm: onHandle,
      onCancel: () => setShowConfirmDialog(false),
    },
    disabled: isDisabled,
    icon: isDeleting ? DeletingIcon : TrashIcon,
    label: isDeleting ? "Deleting..." : "Delete",
    onHandle,
    shortcut: "mod+shift+d",
    tone: "critical",
  };
}
