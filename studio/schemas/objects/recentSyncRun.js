export default {
  name: "recentSyncRun",
  type: "object",
  title: "Recent Sync Run",
  fields: [
    { name: "runId", type: "string", title: "Run ID", readOnly: true },
    {
      name: "generatedAt",
      type: "datetime",
      title: "Generated At",
      readOnly: true,
    },
    { name: "fetched", type: "number", title: "Fetched", readOnly: true },
    { name: "created", type: "number", title: "Created", readOnly: true },
    { name: "updated", type: "number", title: "Updated", readOnly: true },
    {
      name: "noChange",
      type: "number",
      title: "No Change",
      readOnly: true,
    },
    { name: "errors", type: "number", title: "Errors", readOnly: true },
    {
      name: "appliedCreate",
      type: "number",
      title: "Applied Creates",
      readOnly: true,
    },
    {
      name: "appliedUpdate",
      type: "number",
      title: "Applied Updates",
      readOnly: true,
    },
  ],
  preview: {
    select: {
      runId: "runId",
      generatedAt: "generatedAt",
      created: "created",
      updated: "updated",
      errors: "errors",
    },
    prepare(selection) {
      const { runId, generatedAt, created, updated, errors } = selection;
      const shortRun = String(runId || "").slice(0, 18);
      return {
        title: shortRun ? `Run ${shortRun}` : "Run",
        subtitle: `${generatedAt || ""} | +${created || 0} / ~${updated || 0} / !${errors || 0}`,
      };
    },
  },
};