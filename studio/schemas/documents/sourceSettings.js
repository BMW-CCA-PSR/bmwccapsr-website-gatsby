import SourceSettingsAutoRefreshInput from "../../src/components/SourceSettingsAutoRefreshInput";
import NextInvocationAtInput from "../../src/components/NextInvocationAtInput";
import {
  buildScheduleExpressionFromDocument,
  defaultSourceSettingsSchedule,
} from "../../src/lib/sourceSettingsSchedule";

const minuteOptions = Array.from({ length: 12 }, (_, index) => {
  const value = String(index * 5).padStart(2, "0");
  return { title: value, value };
});

const hourOptions = Array.from({ length: 24 }, (_, index) => {
  const value = String(index).padStart(2, "0");
  return { title: `${value}:00`, value };
});

const hasAutoRefreshWebhook = Boolean(
  process.env.SANITY_STUDIO_MSR_SYNC_WEBHOOK_URL
);

export default {
  name: "sourceSettings",
  type: "document",
  title: "Source Settings",
  initialValue: () => ({
    title: "MSR",
    sourceType: "msr",
    syncFrequency: defaultSourceSettingsSchedule.syncFrequency,
    syncHourUtc: defaultSourceSettingsSchedule.syncHourUtc,
    syncMinuteUtc: defaultSourceSettingsSchedule.syncMinuteUtc,
    syncWeekdayUtc: defaultSourceSettingsSchedule.syncWeekdayUtc,
    syncScheduleExpression: "cron(15 9 * * ? *)",
    recentRunsLimit: 10,
  }),
  fieldsets: [
    {
      name: "sync",
      title: "Sync Controls",
      options: { collapsible: false },
    },
    {
      name: "status",
      title: "Current Status",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "history",
      title: "Recent Executions",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      readOnly: true,
      hidden: true,
      initialValue: "MSR",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "sourceType",
      type: "string",
      title: "Source",
      readOnly: true,
      hidden: true,
      options: {
        list: [{ title: "MSR", value: "msr" }],
        layout: "radio",
      },
      validation: (Rule) => Rule.required().valid("msr"),
    },
    {
      name: "syncEnabled",
      type: "boolean",
      title: "Automatic Sync",
      fieldset: "sync",
      components: {
        input: SourceSettingsAutoRefreshInput,
      },
      initialValue: true,
    },
    {
      name: "syncFrequency",
      type: "string",
      title: "Sync Frequency",
      fieldset: "sync",
      initialValue: defaultSourceSettingsSchedule.syncFrequency,
      options: {
        list: [
          { title: "Daily", value: "daily" },
          { title: "Every 12 hours", value: "every12hours" },
          { title: "Weekly", value: "weekly" },
        ],
      },
      hidden: ({ document }) => document?.syncEnabled === false,
      validation: (Rule) =>
        Rule.required().valid("daily", "every12hours", "weekly"),
    },
    {
      name: "syncWeekdayUtc",
      type: "string",
      title: "Day of Week (UTC)",
      fieldset: "sync",
      initialValue: defaultSourceSettingsSchedule.syncWeekdayUtc,
      options: {
        list: [
          { title: "Monday", value: "MON" },
          { title: "Tuesday", value: "TUE" },
          { title: "Wednesday", value: "WED" },
          { title: "Thursday", value: "THU" },
          { title: "Friday", value: "FRI" },
          { title: "Saturday", value: "SAT" },
          { title: "Sunday", value: "SUN" },
        ],
      },
      hidden: ({ document }) =>
        document?.syncEnabled === false || document?.syncFrequency !== "weekly",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "syncHourUtc",
      type: "string",
      title: "Hour (UTC)",
      description: "Used for daily and weekly schedules.",
      fieldset: "sync",
      initialValue: defaultSourceSettingsSchedule.syncHourUtc,
      options: {
        list: hourOptions,
      },
      hidden: ({ document }) =>
        document?.syncEnabled === false || document?.syncFrequency === "every12hours",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "syncMinuteUtc",
      type: "string",
      title: "Minute (UTC)",
      fieldset: "sync",
      initialValue: defaultSourceSettingsSchedule.syncMinuteUtc,
      options: {
        list: minuteOptions,
      },
      hidden: ({ document }) => document?.syncEnabled === false,
      validation: (Rule) => Rule.required(),
    },
    {
      name: "syncScheduleExpression",
      type: "string",
      title: "Computed AWS Schedule Expression",
      description:
        "Automatically generated from the controls above.",
      fieldset: "sync",
      readOnly: true,
      hidden: true,
      validation: (Rule) => Rule.required(),
    },
    {
      name: "recentRunsLimit",
      type: "number",
      title: "Recent Executions to Fetch",
      description: "How many recent sync summaries to load when applying settings.",
      fieldset: "sync",
      initialValue: 10,
      hidden: () => !hasAutoRefreshWebhook,
      validation: (Rule) => Rule.required().min(1).max(50),
    },
    {
      name: "currentScheduleExpression",
      type: "string",
      title: "Current AWS Schedule",
      fieldset: "status",
      readOnly: true,
      hidden: true,
    },
    {
      name: "nextInvocationAt",
      type: "datetime",
      title: "Next Scheduled Run (UTC)",
      description: "The next time the sync will automatically run, in UTC timezone.",
      fieldset: "status",
      readOnly: true,
      hidden: ({ document }) => document?.syncEnabled === false,
      components: {
        input: NextInvocationAtInput,
      },
    },
    {
      name: "lastAppliedAt",
      type: "datetime",
      title: "Last Settings Apply From Studio",
      description:
        "When someone last clicked Apply Source Settings and successfully pushed settings to AWS.",
      fieldset: "status",
      readOnly: true,
    },
    {
      name: "lastRefreshedAt",
      type: "datetime",
      title: "Last Refreshed",
      fieldset: "status",
      readOnly: true,
    },
    {
      name: "recentRuns",
      type: "array",
      title: "Recent Sync Runs",
      fieldset: "history",
      readOnly: true,
      of: [{ type: "recentSyncRun" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      sourceType: "sourceType",
      schedule: "syncScheduleExpression",
    },
    prepare({ title, sourceType, schedule }) {
      const sourceLabel = String(sourceType || "source").toUpperCase();
      const displayTitle =
        String(title || "").trim() || sourceLabel || "Source Settings";
      const effectiveSchedule =
        String(schedule || "").trim() ||
        buildScheduleExpressionFromDocument({
          syncFrequency: defaultSourceSettingsSchedule.syncFrequency,
          syncHourUtc: defaultSourceSettingsSchedule.syncHourUtc,
          syncMinuteUtc: defaultSourceSettingsSchedule.syncMinuteUtc,
          syncWeekdayUtc: defaultSourceSettingsSchedule.syncWeekdayUtc,
        });
      return {
        title: displayTitle,
        subtitle: `${sourceLabel} | ${effectiveSchedule || "No schedule"}`,
      };
    },
  },
};
