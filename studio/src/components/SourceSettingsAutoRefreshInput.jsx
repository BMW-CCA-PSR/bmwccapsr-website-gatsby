import React, { useEffect } from "react";
import { useClient, useFormValue } from "sanity";
import { deriveScheduleControlsFromExpression } from "../lib/sourceSettingsSchedule";

const webhookUrl = process.env.SANITY_STUDIO_MSR_SYNC_WEBHOOK_URL || "";
const webhookToken = process.env.SANITY_STUDIO_MSR_SYNC_WEBHOOK_TOKEN || "";

const normalizeDocumentId = (value) =>
  String(value || "")
    .trim()
    .replace(/^drafts\./, "");

const toIsoOrNull = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const mapRecentRuns = (recentRunsPayload) => {
  if (!Array.isArray(recentRunsPayload)) return [];
  return recentRunsPayload.map((run) => ({
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
  }));
};

const SourceSettingsAutoRefreshInput = (props) => {
  const { renderDefault } = props;
  const client = useClient({ apiVersion: "2021-08-31" });
  const docIdValue = useFormValue(["_id"]);
  const titleValue = useFormValue(["title"]);
  const sourceTypeValue = useFormValue(["sourceType"]);
  const recentRunsLimitValue = useFormValue(["recentRunsLimit"]);

  useEffect(() => {
    const resolvedDocumentId = normalizeDocumentId(docIdValue);
    if (!resolvedDocumentId) return;

    const sourceType = String(sourceTypeValue || "msr").trim().toLowerCase() || "msr";
    const desiredTitle = String(sourceType).toUpperCase();
    const currentTitle = String(titleValue || "").trim();
    if (currentTitle) return;

    client
      .patch(resolvedDocumentId)
      .set({
        title: desiredTitle,
        sourceType,
      })
      .commit()
      .catch(() => {
        // Silent by design; this is a best-effort title fix.
      });
  }, [client, docIdValue, sourceTypeValue, titleValue]);

  const refreshedForDocRef = React.useRef("");

  useEffect(() => {
    const resolvedDocumentId = normalizeDocumentId(docIdValue);
    if (!resolvedDocumentId) return;
    if (!webhookUrl) return;
    if (refreshedForDocRef.current === resolvedDocumentId) return;

    refreshedForDocRef.current = resolvedDocumentId;

    const sourceType = String(sourceTypeValue || "msr").trim().toLowerCase() || "msr";
    const recentRunsLimit = Math.max(
      1,
      Math.min(50, Number(recentRunsLimitValue || 10) || 10)
    );

    let cancelled = false;

    const run = async () => {
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
            source: sourceType,
            recentRunsLimit,
            trigger: {
              source: "sanity_source_settings_auto_refresh",
              documentId: resolvedDocumentId,
            },
          }),
        });
        clearTimeout(timeout);

        if (!response.ok) return;
        const rawText = await response.text();
        const payload = rawText ? JSON.parse(rawText) : {};
        if (cancelled) return;

        const returnedSchedule = String(payload?.scheduleExpression || "").trim();
        const controls = deriveScheduleControlsFromExpression(returnedSchedule);
        const recentRuns = mapRecentRuns(payload?.recentRuns);

        const patch = client.patch(resolvedDocumentId).set({
          title: String(sourceType || "source").toUpperCase(),
          sourceType,
          syncEnabled: payload?.enabled === undefined ? true : Boolean(payload?.enabled),
          syncScheduleExpression: returnedSchedule,
          syncFrequency: controls.syncFrequency,
          syncHourUtc: controls.syncHourUtc,
          syncMinuteUtc: controls.syncMinuteUtc,
          syncWeekdayUtc: controls.syncWeekdayUtc,
          currentScheduleExpression: returnedSchedule,
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
      } catch (_error) {
        // Silent by design to avoid noisy toasts on page load.
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    client,
    docIdValue,
    sourceTypeValue,
    recentRunsLimitValue,
  ]);

  return renderDefault(props);
};

export default SourceSettingsAutoRefreshInput;
