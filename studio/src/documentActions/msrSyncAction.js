import React from "react";
import { SyncIcon } from "@sanity/icons";
import { Spinner, useToast } from "@sanity/ui";
import { useDocumentOperation } from "sanity";

const webhookUrl = process.env.SANITY_STUDIO_MSR_SYNC_WEBHOOK_URL || "";

const webhookToken = process.env.SANITY_STUDIO_MSR_SYNC_WEBHOOK_TOKEN || "";

const normalizeDocumentId = (value) =>
  String(value || "")
    .trim()
    .replace(/^drafts\./, "");

const normalizeSource = (value) => String(value || "").trim().toLowerCase();

const getSchemaTypeName = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value.name === "string") return value.name;
  return "";
};

const extractMsrEventId = (documentId) => {
  const normalized = normalizeDocumentId(documentId).toLowerCase();
  const prefix = "event-msr-";
  if (!normalized.startsWith(prefix)) return "";
  return normalized.slice(prefix.length);
};

const SyncingIcon = () =>
  React.createElement(Spinner, {
    muted: true,
    size: 1,
    style: {
      display: "block",
      margin: "0 auto",
    },
  });

export function SyncWithMsrAction(props) {
  const { type, schemaType, draft, published, id, documentId, onComplete } = props;
  const toast = useToast();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const schemaTypeName = getSchemaTypeName(type) || getSchemaTypeName(schemaType);
  if (schemaTypeName !== "event") return null;

  const documentValue = draft || published;
  const resolvedOperationId = normalizeDocumentId(
    documentValue?._id || id || documentId
  );
  const ops = useDocumentOperation(resolvedOperationId, "event");
  const normalizedId = normalizeDocumentId(
    documentValue?._id || id || documentId
  ).toLowerCase();
  const draftSource = normalizeSource(draft?.source);
  const publishedSource = normalizeSource(published?.source);
  const isMsrBySource = draftSource === "msr" || publishedSource === "msr";
  const isMsrById = normalizedId.startsWith("event-msr-");
  if (!isMsrBySource && !isMsrById) return null;

  const handleComplete = () => {
    if (typeof onComplete === "function") onComplete();
  };

  const triggerSync = async () => {
    if (!webhookUrl) {
      toast.push({
        status: "error",
        title: "MSR sync webhook is not configured",
        description:
          "Set SANITY_STUDIO_MSR_SYNC_WEBHOOK_URL to enable this action.",
      });
      handleComplete();
      return;
    }

    const resolvedDocumentId = normalizeDocumentId(
      documentValue?._id || id || documentId
    );
    const msrEventId = extractMsrEventId(resolvedDocumentId);

    setIsSyncing(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(webhookUrl, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          ...(webhookToken ? { "x-msr-sync-token": webhookToken } : {}),
        },
        signal: controller.signal,
        body: JSON.stringify({
          applyWrites: true,
          maxCreates: 0,
          maxUpdates: 1,
          ...(msrEventId ? { eventIds: [msrEventId] } : {}),
          trigger: {
            source: "sanity_studio_action",
            documentId: resolvedDocumentId,
          },
        }),
      });
      clearTimeout(timeout);

      const rawText = await response.text();
      if (!response.ok) {
        throw new Error(
          `Webhook returned ${response.status}: ${rawText.slice(0, 220)}`
        );
      }

      toast.push({
        status: "success",
        title: "MSR sync triggered",
        description: "Requested an on-demand sync for this event. Background publish queued.",
      });

      // Publish in the background once the synced draft is available.
      let attempts = 0;
      const maxAttempts = 30;
      const attemptPublish = () => {
        attempts += 1;
        if (ops?.publish && !ops.publish.disabled) {
          ops.publish.execute();
          return;
        }
        if (attempts < maxAttempts) {
          setTimeout(attemptPublish, 1000);
        }
      };
      setTimeout(attemptPublish, 0);
    } catch (error) {
      const networkHint =
        error instanceof TypeError || (error instanceof Error && error.name === "AbortError")
          ? `Network request failed. URL=${webhookUrl}`
          : null;
      toast.push({
        status: "error",
        title: "Failed to trigger MSR sync",
        description:
          networkHint ||
          (error instanceof Error
            ? error.message
            : "Unexpected error while calling sync webhook."),
      });
    } finally {
      setIsSyncing(false);
      handleComplete();
    }
  };

  return {
    label: isSyncing ? "Syncing with MSR..." : "Sync with MSR",
    title: webhookUrl
      ? "Trigger an on-demand sync for this MSR event."
      : "Configure SANITY_STUDIO_MSR_SYNC_WEBHOOK_URL to enable this action.",
    icon: isSyncing ? SyncingIcon : SyncIcon,
    disabled: isSyncing,
    onHandle: triggerSync,
  };
}
