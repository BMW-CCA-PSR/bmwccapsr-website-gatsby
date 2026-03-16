const DEFAULT_SCHEDULE = {
  syncFrequency: "daily",
  syncHourUtc: "09",
  syncMinuteUtc: "15",
  syncWeekdayUtc: "MON",
};

const clampMinute = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 15;
  return Math.max(0, Math.min(59, Math.round(n)));
};

const clampHour = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 9;
  return Math.max(0, Math.min(23, Math.round(n)));
};

const pad2 = (value) => String(value).padStart(2, "0");

export const buildScheduleExpressionFromDocument = (documentValue = {}) => {
  const frequency = String(documentValue?.syncFrequency || DEFAULT_SCHEDULE.syncFrequency)
    .trim()
    .toLowerCase();
  const minute = clampMinute(documentValue?.syncMinuteUtc);
  const hour = clampHour(documentValue?.syncHourUtc);
  const weekday = String(documentValue?.syncWeekdayUtc || DEFAULT_SCHEDULE.syncWeekdayUtc)
    .trim()
    .toUpperCase();

  if (frequency === "every12hours") {
    return `cron(${minute} */12 * * ? *)`;
  }

  if (frequency === "weekly") {
    const safeWeekday = /^[A-Z]{3}$/.test(weekday)
      ? weekday
      : DEFAULT_SCHEDULE.syncWeekdayUtc;
    return `cron(${minute} ${hour} ? * ${safeWeekday} *)`;
  }

  return `cron(${minute} ${hour} * * ? *)`;
};

export const deriveScheduleControlsFromExpression = (scheduleExpression) => {
  const expression = String(scheduleExpression || "").trim();
  if (!expression) {
    return { ...DEFAULT_SCHEDULE };
  }

  const every12 = expression.match(/^cron\((\d{1,2})\s+\*\/12\s+\*\s+\*\s+\?\s+\*\)$/i);
  if (every12) {
    return {
      syncFrequency: "every12hours",
      syncHourUtc: DEFAULT_SCHEDULE.syncHourUtc,
      syncMinuteUtc: pad2(clampMinute(every12[1])),
      syncWeekdayUtc: DEFAULT_SCHEDULE.syncWeekdayUtc,
    };
  }

  const weekly = expression.match(/^cron\((\d{1,2})\s+(\d{1,2})\s+\?\s+\*\s+([A-Z]{3})\s+\*\)$/i);
  if (weekly) {
    return {
      syncFrequency: "weekly",
      syncHourUtc: pad2(clampHour(weekly[2])),
      syncMinuteUtc: pad2(clampMinute(weekly[1])),
      syncWeekdayUtc: String(weekly[3]).toUpperCase(),
    };
  }

  const daily = expression.match(/^cron\((\d{1,2})\s+(\d{1,2})\s+\*\s+\*\s+\?\s+\*\)$/i);
  if (daily) {
    return {
      syncFrequency: "daily",
      syncHourUtc: pad2(clampHour(daily[2])),
      syncMinuteUtc: pad2(clampMinute(daily[1])),
      syncWeekdayUtc: DEFAULT_SCHEDULE.syncWeekdayUtc,
    };
  }

  return { ...DEFAULT_SCHEDULE };
};

export const defaultSourceSettingsSchedule = { ...DEFAULT_SCHEDULE };
