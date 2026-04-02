export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const normalizeMonthToken = (value) => String(value || "").trim();

export const parseIssueMonths = (publishMonth) => {
  const normalized = normalizeMonthToken(publishMonth);
  if (!normalized) return [];

  const matches = normalized.match(/\d{1,2}/g) || [];
  const months = matches
    .map((token) => Number(token))
    .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12);

  if (months.length === 0) return [];
  return months.slice(0, 2);
};

export const isValidIssueMonthInput = (publishMonth) => {
  const normalized = normalizeMonthToken(publishMonth);
  if (!normalized) return false;

  const months = parseIssueMonths(normalized);
  if (months.length === 0) return false;

  const tokenCount = (normalized.match(/\d{1,2}/g) || []).length;
  return tokenCount === months.length && tokenCount <= 2;
};

export const buildIssueTitle = (publishMonth, publishYear) => {
  const months = parseIssueMonths(publishMonth);
  const yearNumber = Number(publishYear);

  if (months.length === 0) return "";
  if (!Number.isInteger(yearNumber) || yearNumber < 1900 || yearNumber > 2100) {
    return "";
  }

  const monthLabel = months
    .map((monthNumber) => MONTH_NAMES[monthNumber - 1])
    .filter(Boolean)
    .join("/");

  return monthLabel ? `${monthLabel} ${yearNumber}` : "";
};

export const getIssueMonthSortValue = (publishMonth) => {
  const months = parseIssueMonths(publishMonth);
  return months[0] || null;
};