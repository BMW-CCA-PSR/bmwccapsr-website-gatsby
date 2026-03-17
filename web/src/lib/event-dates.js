import { endOfDay, isValid, parseISO } from "date-fns";

const DATE_TOKEN_PATTERN = /^(\d{4}-\d{2}-\d{2})/;

export const toDateToken = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return null;

  const match = normalized.match(DATE_TOKEN_PATTERN);
  if (match?.[1]) return match[1];

  const parsed = parseISO(normalized);
  if (!isValid(parsed)) return null;
  return parsed.toISOString().slice(0, 10);
};

export const parseEventDateValue = (value) => {
  const token = toDateToken(value);
  if (!token) return null;
  const parsed = parseISO(token);
  return isValid(parsed) ? parsed : null;
};

export const getEventStartValue = (event) =>
  event?.startDate || toDateToken(event?.startTime) || null;

export const getEventEndValue = (event) =>
  event?.endDate ||
  toDateToken(event?.endTime) ||
  event?.startDate ||
  toDateToken(event?.startTime) ||
  null;

export const getEventStartDate = (event) =>
  parseEventDateValue(getEventStartValue(event));

export const getEventEndDate = (event) =>
  parseEventDateValue(getEventEndValue(event));

export const getEventStartTimestamp = (event) => {
  const startDate = getEventStartDate(event);
  return startDate ? startDate.getTime() : NaN;
};

export const getEventEndBoundaryTimestamp = (event) => {
  const endDate = getEventEndDate(event);
  return endDate ? endOfDay(endDate).getTime() : NaN;
};