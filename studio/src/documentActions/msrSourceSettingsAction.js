import React from "react";
import { SyncIcon } from "@sanity/icons";
import { Spinner, useToast } from "@sanity/ui";
import { useClient, useDocumentOperation } from "sanity";
import {
  buildScheduleExpressionFromDocument,
  deriveScheduleControlsFromExpression,
} from "../lib/sourceSettingsSchedule";

const webhookUrl = process.env.SANITY_STUDIO_MSR_SYNC_WEBHOOK_URL || "";
const webhookToken = process.env.SANITY_STUDIO_MSR_SYNC_WEBHOOK_TOKEN || "";

const normalizeDocumentId = (value) =>
  String(value || "")
    .trim()
    .replace(/^drafts\./, "");

const getSchemaTypeName = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value.name === "string") return value.name;
  return "";
};

const toIsoOrNull = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
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

export function ApplyMsrSourceSettingsAction(props) {
  const { type, schemaType, draft, published, id, documentId, onComplete } = props;
  const toast = useToast();
  const client = useClient({ apiVersion: "2021-08-31" });
  const [isApplying, setIsApplying] = React.useState(false);
  const resolvedOperationId = normalizeDocumentId(id || documentId);
  const ops = useDocumentOperation(resolvedOperationId, "sourceSettings");

  const schemaTypeName = getSchemaTypeName(type) || getSchemaTypeName(schemaType);
  if (schemaTypeName !== "sourceSettings") return null;

  const documentValue = draft || published || {};
  const sourceType = String(documentValue?.sourceType || "").trim().toLowerCase();
  if (sourceType && sourceType !== "msr") return null;

  const handleComplete = () => {
    if (typeof onComplete === "function") onComplete();
  };

  const applySettings = async () => {
    if (!webhookUrl) {
      toast.push({
        status: "error",
        title: "MSR sync webhook is not configured",
        description:
          "Set SANITY_STUDIO_MSR_SYNC_WEBHOOK_URL to enable source settings apply.",
      });
      handleComplete();
      return;
    }

    const resolvedDocumentId = normalizeDocumentId(
      documentValue?._id || id || documentId
    );
    const scheduleExpression = buildScheduleExpressionFromDocument(documentValue);
    const recentRunsLimit = Math.max(
      1,
      Math.min(50, Number(documentValue?.recentRunsLimit || 10) || 10)
    );
    const syncEnabled = documentValue?.syncEnabled !== false;

    setIsApplying(true);
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
          operation: "source_settings",
          source: "msr",
          scheduleExpression,
          enabled: syncEnabled,
          recentRunsLimit,
          trigger: {
            source: "sanity_source_settings_action",
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

      let payload = {};
      try {
        payload = rawText ? JSON.parse(rawText) : {};
      } catch (_error) {
        payload = {};
      }

      const recentRuns = Array.isArray(payload?.recentRuns)
        ? payload.recentRuns.map((run) => ({
            _type: "recentSyncRun",
            _key: String(run?.runId || run?.generatedAt || Math.random()),
            runId: String(run?.runId || ""),
            generatedAt: toIsoOrNull(run?.generatedAt),
            fetched: Number(run?.totals?.fetched || 0),
            created: Number(run?.totals?.create || 0),
            updated: Number(run?.totals?.update || 0),
            noChange: Number(run?.totals?.noChange || 0),
            errors: Number(run?.totals?.error || 0),
            appliedCreate: Number(run?.writes?.applied?.create || 0),
            appliedUpdate: Number(run?.writes?.applied?.update || 0),
          }))
        : [];

      const patch = client.patch(resolvedDocumentId).set({
        title: String(payload?.source || "msr").toUpperCase(),
        sourceType: "msr",
        syncScheduleExpression: String(payload?.scheduleExpression || scheduleExpression || ""),
        ...deriveScheduleControlsFromExpression(
          String(payload?.scheduleExpression || scheduleExpression || "")
        ),
        syncEnabled:
          payload?.enabled === undefined ? syncEnabled : Boolean(payload?.enabled),
        currentScheduleExpression: String(payload?.scheduleExpression || scheduleExpression || ""),
        lastAppliedAt: toIsoOrNull(payload?.appliedAt) || new Date().toISOString(),
        lastRefreshedAt: new Date().toISOString(),
        recentRuns,
      });

      const nextInvocationAt = toIsoOrNull(payload?.nextInvocationAt);
      if (nextInvocationAt) {
        patch.set({ nextInvocationAt });
      } else {
        patch.unset(["nextInvocationAt"]);
      }

      await patch.commit();

      if (ops?.publish && !ops.publish.disabled) {
        ops.publish.execute();
      }

      toast.push({
        status: "success",
        title: "Source settings applied",
        description: "Schedule was applied, refreshed, and published.",
      });
    } catch (error) {
      const networkHint =
        error instanceof TypeError ||
        (error instanceof Error && error.name === "AbortError")
          ? `Network request failed. URL=${webhookUrl}`
          : null;
      toast.push({
        status: "error",
        title: "Failed to apply source settings",
        description:
          networkHint ||
          (error instanceof Error
            ? error.message
            : "Unexpected error while applying source settings."),
      });
    } finally {
      setIsApplying(false);
      handleComplete();
    }
  };

  return {
    label: isApplying ? "Applying Source Settings..." : "Apply Source Settings",
    title: webhookUrl
      ? "Apply the AWS schedule and refresh recent run summaries."
      : "Configure SANITY_STUDIO_MSR_SYNC_WEBHOOK_URL to enable this action.",
    icon: isApplying ? SyncingIcon : SyncIcon,
    disabled: isApplying,
    onHandle: applySettings,
  };
}
