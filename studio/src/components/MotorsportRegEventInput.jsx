import React, { useEffect, useMemo, useState } from "react";
import { LaunchIcon, RefreshIcon, TrashIcon } from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Select,
  Stack,
  Text,
  useRootTheme,
} from "@sanity/ui";
import {
  set,
  unset,
  useClient,
  useDocumentOperation,
  useFormValue,
} from "sanity";

const API_VERSION = "2025-01-01";
const API_BASE =
  process.env.SANITY_STUDIO_MOTORSPORTREG_API_BASE ||
  "https://api.motorsportreg.com";
const ORG_ID =
  process.env.SANITY_STUDIO_MOTORSPORTREG_ORG_ID ||
  "E459757B-AF0D-6403-449F2BFCAF307273";
const PUBLIC_SITE_URL =
  process.env.SANITY_STUDIO_PUBLIC_SITE_URL || "https://bmw-club-psr.org";
const MSR_LOGO_DARK =
  "https://msr-hotlink.s3.amazonaws.com/powered-by/powered-by-msr-default@2x.png";
const MSR_LOGO_LIGHT =
  "https://msr-hotlink.s3.amazonaws.com/powered-by/powered-by-msr-outline@2x.png";

const EVENT_SOURCE = {
  MSR: "msr",
  SANITY: "sanity",
};

const SANITY_EVENT_QUERY = `*[_type == "event" && (
  (defined(endTime) && dateTime(endTime) >= dateTime(now())) ||
  (!defined(endTime) && dateTime(startTime) >= dateTime(now()))
)] | order(startTime asc){
  _id,
  title,
  startTime,
  endTime,
  onlineLink,
  venueName,
  slug {
    current
  },
  address {
    city,
    state
  },
  category->{
    title
  },
  mainImage {
    asset->{
      url
    }
  }
}`;

const buildCalendarUrl = () => {
  if (!ORG_ID) return null;
  const start = new Date();
  const end = new Date();
  end.setFullYear(end.getFullYear() + 1);
  const params = new URLSearchParams({
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    exclude_cancelled: "true",
  });
  return `${API_BASE}/rest/calendars/organization/${ORG_ID}.json?${params.toString()}`;
};

const normalizeEvents = (payload) => {
  const events = payload?.response?.events || payload?.events || [];
  if (Array.isArray(events)) return events;
  if (Array.isArray(events?.event)) return events.event;
  if (events?.event) return [events.event];
  return [];
};

const normalizeImageUrl = (value) => {
  if (!value) return null;
  if (value.startsWith("//")) return `https:${value}`;
  return value;
};

const normalizeDateTimeValue = (value) => {
  if (!value) return null;
  const normalized = String(value).trim();
  if (!normalized) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return `${normalized}T00:00:00`;
  }
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalized)) {
    return `${normalized.replace(" ", "T")}:00`;
  }
  return normalized;
};

const parseCoordinate = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
};

const extractEventCoordinates = (event) => {
  const venue = event?.venue || {};
  const location = event?.location || {};
  const coordinateSource =
    event?.coordinates || venue?.coordinates || venue?.geo?.coordinates;

  let latitude =
    parseCoordinate(event?.latitude) ??
    parseCoordinate(event?.lat) ??
    parseCoordinate(venue?.lat) ??
    parseCoordinate(venue?.latitude) ??
    parseCoordinate(venue?.geo?.lat) ??
    parseCoordinate(venue?.geo?.latitude) ??
    parseCoordinate(venue?.location?.lat) ??
    parseCoordinate(venue?.location?.latitude) ??
    parseCoordinate(location?.lat) ??
    parseCoordinate(location?.latitude) ??
    parseCoordinate(coordinateSource?.lat) ??
    parseCoordinate(coordinateSource?.latitude);

  let longitude =
    parseCoordinate(event?.longitude) ??
    parseCoordinate(event?.lng) ??
    parseCoordinate(event?.lon) ??
    parseCoordinate(event?.long) ??
    parseCoordinate(venue?.lng) ??
    parseCoordinate(venue?.lon) ??
    parseCoordinate(venue?.long) ??
    parseCoordinate(venue?.longitude) ??
    parseCoordinate(venue?.geo?.lng) ??
    parseCoordinate(venue?.geo?.lon) ??
    parseCoordinate(venue?.geo?.long) ??
    parseCoordinate(venue?.geo?.longitude) ??
    parseCoordinate(venue?.location?.lng) ??
    parseCoordinate(venue?.location?.lon) ??
    parseCoordinate(venue?.location?.long) ??
    parseCoordinate(venue?.location?.longitude) ??
    parseCoordinate(location?.lng) ??
    parseCoordinate(location?.lon) ??
    parseCoordinate(location?.long) ??
    parseCoordinate(location?.longitude) ??
    parseCoordinate(coordinateSource?.lng) ??
    parseCoordinate(coordinateSource?.lon) ??
    parseCoordinate(coordinateSource?.long) ??
    parseCoordinate(coordinateSource?.longitude);

  if (
    (latitude === null || longitude === null) &&
    Array.isArray(coordinateSource) &&
    coordinateSource.length >= 2
  ) {
    const guessedLongitude = parseCoordinate(coordinateSource[0]);
    const guessedLatitude = parseCoordinate(coordinateSource[1]);
    latitude = latitude ?? guessedLatitude;
    longitude = longitude ?? guessedLongitude;
  }

  return {
    latitude,
    longitude,
  };
};

const formatCoordinate = (value) => {
  const parsed = parseCoordinate(value);
  return parsed === null ? null : parsed.toFixed(6);
};

const formatCoordinateLabel = (latitude, longitude) => {
  const lat = formatCoordinate(latitude);
  const lng = formatCoordinate(longitude);
  if (!lat && !lng) return null;
  if (lat && lng) return `Lat ${lat}, Lng ${lng}`;
  if (lat) return `Lat ${lat}`;
  return `Lng ${lng}`;
};

const toDateToken = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const EVENT_NAME_NOISE_PATTERNS = [
  /\bbmw\s*cca\b/gi,
  /\bbmwcca\b/gi,
  /\bpsr\b/gi,
  /\bpuget\s+sound\s+chapter\b/gi,
];

const EVENT_NAME_DATE_PATTERNS = [
  /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?\b/gi,
  /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g,
  /\b\d{4}-\d{2}-\d{2}\b/g,
];

const LOCATION_TOKEN_IGNORE = new Set(["the", "and", "at", "in", "of"]);

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getLocationTokens = ({ venueName, venueCity, venueRegion } = {}) => {
  const parts = [venueName, venueCity, venueRegion]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean);
  if (!parts.length) return [];

  const tokenSet = new Set();
  parts.forEach((part) => {
    part
      .split(/[^a-z0-9]+/i)
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach((token) => {
        const lower = token.toLowerCase();
        const isStateCode = /^[A-Z]{2}$/.test(token);
        if (LOCATION_TOKEN_IGNORE.has(lower)) return;
        if (!isStateCode && token.length < 3) return;
        tokenSet.add(lower);
      });
  });

  return [...tokenSet];
};

const toPlainEventName = (value, locationMeta = {}) => {
  let text = String(value || "").trim();
  if (!text) return "";

  EVENT_NAME_NOISE_PATTERNS.forEach((pattern) => {
    text = text.replace(pattern, " ");
  });
  EVENT_NAME_DATE_PATTERNS.forEach((pattern) => {
    text = text.replace(pattern, " ");
  });

  return text
    .replace(/\s*[-:|]+\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const normalizeComparableText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\bccc\b/g, " car control clinic ")
    .replace(/\bhpde\b/g, " high performance driving education ")
    .replace(/\b\d{4}\b/g, " ")
    .replace(/\b(bmw|cca|bmwcca|psr|puget|sound|chapter|event|events)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const toTokenSet = (value) =>
  new Set(
    normalizeComparableText(value)
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length > 2),
  );

const hasStrongTokenOverlap = (left, right) => {
  const leftTokens = [...toTokenSet(left)];
  const rightTokens = [...toTokenSet(right)];
  if (!leftTokens.length || !rightTokens.length) return false;
  const rightSet = new Set(rightTokens);
  const overlap = leftTokens.filter((token) => rightSet.has(token)).length;
  return overlap / Math.min(leftTokens.length, rightTokens.length) >= 0.7;
};

const hasComparableNameMatch = (left, right) => {
  const normalizedLeft = normalizeComparableText(left);
  const normalizedRight = normalizeComparableText(right);
  if (!normalizedLeft || !normalizedRight) return false;
  if (normalizedLeft === normalizedRight) return true;
  if (
    normalizedLeft.length >= 6 &&
    normalizedRight.length >= 6 &&
    (normalizedLeft.includes(normalizedRight) ||
      normalizedRight.includes(normalizedLeft))
  ) {
    return true;
  }
  return hasStrongTokenOverlap(normalizedLeft, normalizedRight);
};

const extractOrganizationId = (value) => {
  const raw =
    value?.organizationId || value?.organization?.uri || ORG_ID || null;
  if (!raw) return null;
  const normalized = String(raw);
  const segments = normalized.split("/").filter(Boolean);
  return segments[segments.length - 1] || normalized;
};

const buildPublicEventUrl = (slug) => {
  const current = String(slug || "").trim();
  if (!current) return null;
  return `${PUBLIC_SITE_URL.replace(/\/$/, "")}/events/${current}/`;
};

const buildMsrEventOption = (event) => {
  const venue = event?.venue || {};
  const rawName = event?.name || event?.title || null;
  const cleanedName = toPlainEventName(rawName, {
    venueName: venue?.name,
    venueCity: venue?.city,
    venueRegion: venue?.region || venue?.state,
  });
  const { latitude, longitude } = extractEventCoordinates(event);
  const rawImageUrl =
    event?.image?.standard ||
    event?.image?.preview ||
    event?.image?.url ||
    event?.image?.original ||
    null;
  const selectionToken =
    event?.id ||
    event?.uri ||
    event?.detailuri ||
    `${event?.name || ""}-${event?.start || ""}`;

  return {
    selectionId: `msr:${String(selectionToken)}`,
    origin: EVENT_SOURCE.MSR,
    eventId: event?.id ? String(event.id) : null,
    sanityEventId: null,
    name: cleanedName || rawName,
    start: normalizeDateTimeValue(event?.start || event?.start_date || null),
    end: normalizeDateTimeValue(event?.end || event?.end_date || null),
    url: event?.detailuri || event?.detail_url || event?.url || null,
    venueName: venue?.name || null,
    venueCity: venue?.city || null,
    venueRegion: venue?.region || venue?.state || null,
    latitude,
    longitude,
    imageUrl: normalizeImageUrl(rawImageUrl),
    organizationId: extractOrganizationId(event),
    eventType: event?.type || null,
    registrationStart: normalizeDateTimeValue(event?.registration?.start),
    registrationEnd: normalizeDateTimeValue(event?.registration?.end),
    sourceLabel: "MSR",
  };
};

const buildSanityEventOption = (event) => {
  const selectionToken = event?._id || event?.slug?.current || event?.title;
  const rawName = event?.title || null;
  const cleanedName = toPlainEventName(rawName, {
    venueName: event?.venueName,
    venueCity: event?.address?.city,
    venueRegion: event?.address?.state,
  });
  return {
    selectionId: `sanity:${String(selectionToken || "")}`,
    origin: EVENT_SOURCE.SANITY,
    eventId: null,
    sanityEventId: event?._id || null,
    name: cleanedName || rawName,
    start: normalizeDateTimeValue(event?.startTime || null),
    end: normalizeDateTimeValue(event?.endTime || null),
    url: buildPublicEventUrl(event?.slug?.current) || event?.onlineLink || null,
    venueName: event?.venueName || null,
    venueCity: event?.address?.city || null,
    venueRegion: event?.address?.state || null,
    latitude: null,
    longitude: null,
    imageUrl: normalizeImageUrl(event?.mainImage?.asset?.url),
    organizationId: null,
    eventType: event?.category?.title || null,
    registrationStart: null,
    registrationEnd: null,
    sourceLabel: "Sanity",
  };
};

const buildStoredEventValue = (event) => ({
  _type: "motorsportRegEvent",
  origin: event?.origin || null,
  eventId: event?.eventId || null,
  name:
    toPlainEventName(event?.name || null, {
      venueName: event?.venueName,
      venueCity: event?.venueCity,
      venueRegion: event?.venueRegion,
    }) ||
    event?.name ||
    null,
  start: normalizeDateTimeValue(event?.start || null),
  end: normalizeDateTimeValue(event?.end || null),
  url: event?.url || null,
  venueName: event?.venueName || null,
  venueCity: event?.venueCity || null,
  venueRegion: event?.venueRegion || null,
  latitude: parseCoordinate(event?.latitude),
  longitude: parseCoordinate(event?.longitude),
  imageUrl: normalizeImageUrl(event?.imageUrl),
  organizationId: event?.organizationId || null,
  sanityEventId: event?.sanityEventId || null,
  eventType: event?.eventType || null,
  registrationStart: normalizeDateTimeValue(event?.registrationStart || null),
  registrationEnd: normalizeDateTimeValue(event?.registrationEnd || null),
});

const getStoredSelectionId = (value) => {
  const origin =
    value?.origin ||
    (value?.sanityEventId ? EVENT_SOURCE.SANITY : null) ||
    (value?.eventId ? EVENT_SOURCE.MSR : null);
  if (origin === EVENT_SOURCE.SANITY && value?.sanityEventId) {
    return `sanity:${value.sanityEventId}`;
  }
  if (origin === EVENT_SOURCE.MSR) {
    const token =
      value?.eventId ||
      value?.url ||
      `${value?.name || ""}-${value?.start || ""}`;
    if (token) return `msr:${String(token)}`;
  }
  return "";
};

const haveSameStoredEventValue = (left, right) => {
  const keys = [
    "origin",
    "eventId",
    "sanityEventId",
    "name",
    "start",
    "end",
    "url",
    "venueName",
    "venueCity",
    "venueRegion",
    "latitude",
    "longitude",
    "imageUrl",
    "organizationId",
    "eventType",
    "registrationStart",
    "registrationEnd",
  ];

  return keys.every((key) => {
    const leftValue = left?.[key] ?? null;
    const rightValue = right?.[key] ?? null;
    return leftValue === rightValue;
  });
};

const areEventsLikelyDuplicate = (msrEvent, sanityEvent) => {
  const msrDate = toDateToken(msrEvent?.start);
  const sanityDate = toDateToken(sanityEvent?.start);
  if (!msrDate || !sanityDate || msrDate !== sanityDate) return false;
  return hasComparableNameMatch(msrEvent?.name, sanityEvent?.name);
};

const mergeEvents = (msrEvents, sanityEvents) => {
  const normalizedMsr = (Array.isArray(msrEvents) ? msrEvents : [])
    .map(buildMsrEventOption)
    .filter((event) => Boolean(event.selectionId));
  const normalizedSanity = (Array.isArray(sanityEvents) ? sanityEvents : [])
    .map(buildSanityEventOption)
    .filter((event) => Boolean(event.selectionId))
    .filter(
      (sanityEvent) =>
        !normalizedMsr.some((msrEvent) =>
          areEventsLikelyDuplicate(msrEvent, sanityEvent),
        ),
    );

  return [...normalizedMsr, ...normalizedSanity].sort((left, right) => {
    const leftKey = String(left?.start || "");
    const rightKey = String(right?.start || "");
    if (leftKey !== rightKey) return leftKey.localeCompare(rightKey);
    return String(left?.name || "").localeCompare(String(right?.name || ""));
  });
};

const formatEventLabel = (event) => {
  const rawName = event?.name || "Untitled event";
  const name = toPlainEventName(rawName) || rawName;
  const date = event?.start || null;
  const parts = [];
  if (date) parts.push(String(date).slice(0, 10));
  parts.push(name);
  return `${parts.join(" — ")} [${event?.sourceLabel || "Event"}]`;
};

const formatEventTimestamp = (value) => {
  if (!value) return null;
  const normalized = String(value).replace("T", " ");
  return normalized.length > 16 ? normalized.slice(0, 16) : normalized;
};

const getInclusiveDayCount = (start, end) => {
  const startLabel = start ? String(start).slice(0, 10) : null;
  const endLabel = end ? String(end).slice(0, 10) : null;
  if (!startLabel || !endLabel || startLabel === endLabel) return null;

  const startAt = Date.parse(`${startLabel}T00:00:00Z`);
  const endAt = Date.parse(`${endLabel}T00:00:00Z`);
  if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || endAt < startAt) {
    return null;
  }

  const days = Math.floor((endAt - startAt) / (24 * 60 * 60 * 1000)) + 1;
  return days >= 2 ? days : null;
};

const formatCompactDateRange = (start, end, options = {}) => {
  const { includeDayCount = false } = options;
  const startLabel = start ? String(start).slice(0, 10) : null;
  const endLabel = end ? String(end).slice(0, 10) : null;
  const toSlashDate = (value) => String(value || "").replace(/-/g, "/");
  if (!startLabel) return null;
  if (!endLabel || endLabel === startLabel) return toSlashDate(startLabel);
  const dayCount = includeDayCount ? getInclusiveDayCount(start, end) : null;
  const daySuffix = dayCount
    ? ` (${dayCount} day${dayCount === 1 ? "" : "s"})`
    : "";

  const [startYear, startMonth, startDay] = startLabel.split("-");
  const [endYear, endMonth, endDay] = endLabel.split("-");
  if (
    !startYear ||
    !startMonth ||
    !startDay ||
    !endYear ||
    !endMonth ||
    !endDay
  ) {
    return `${toSlashDate(startLabel)} -> ${toSlashDate(endLabel)}${daySuffix}`;
  }

  if (startYear === endYear && startMonth === endMonth) {
    return `${toSlashDate(startLabel)} -> ${endDay}${daySuffix}`;
  }
  if (startYear === endYear) {
    return `${toSlashDate(startLabel)} -> ${endMonth}/${endDay}${daySuffix}`;
  }
  return `${toSlashDate(startLabel)} -> ${toSlashDate(endLabel)}${daySuffix}`;
};

const formatEventDateRange = (start, end) => {
  return formatCompactDateRange(start, end, { includeDayCount: true });
};

const formatRegistrationDateRange = (start, end) => {
  if (!start && !end) return null;
  return formatCompactDateRange(start, end || start);
};

const MotorsportRegEventInput = (props) => {
  const { value, onChange, readOnly } = props;
  const client = useClient({ apiVersion: API_VERSION });
  const { scheme } = useRootTheme();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(getStoredSelectionId(value));
  const documentId = useFormValue(["_id"]);
  const documentType = useFormValue(["_type"]);
  const currentDate = useFormValue(["date"]);
  const publishedId =
    typeof documentId === "string" ? documentId.replace(/^drafts\./, "") : null;
  const operations = useDocumentOperation(
    publishedId || "",
    documentType || "",
  );

  const filteredEvents = useMemo(() => events, [events]);
  const selectedEvent = useMemo(
    () => events.find((item) => item.selectionId === selectedId) || null,
    [events, selectedId],
  );
  const selectedEventCoordinates = useMemo(
    () => extractEventCoordinates(selectedEvent),
    [selectedEvent],
  );
  const valueCoordinates = useMemo(
    () => extractEventCoordinates(value),
    [value],
  );
  const previewLatitude =
    parseCoordinate(value?.latitude) ??
    valueCoordinates?.latitude ??
    selectedEventCoordinates?.latitude;
  const previewLongitude =
    parseCoordinate(value?.longitude) ??
    valueCoordinates?.longitude ??
    selectedEventCoordinates?.longitude;
  const previewCoordinateLabel = formatCoordinateLabel(
    previewLatitude,
    previewLongitude,
  );
  const isDarkMode = String(scheme || "")
    .toLowerCase()
    .includes("dark");
  const msrLogoSrc = isDarkMode ? MSR_LOGO_DARK : MSR_LOGO_LIGHT;
  const storedSelectionId = getStoredSelectionId(value);
  const msrCount = filteredEvents.filter(
    (event) => event.origin === EVENT_SOURCE.MSR,
  ).length;
  const sanityCount = filteredEvents.filter(
    (event) => event.origin === EVENT_SOURCE.SANITY,
  ).length;
  const registrationDateRange = formatRegistrationDateRange(
    value?.registrationStart,
    value?.registrationEnd,
  );
  const selectedEventDateRange = formatEventDateRange(value?.start, value?.end);

  const updateDate = (nextDate) => {
    if (!publishedId || !documentType) return;
    if (!operations?.patch || operations.patch.disabled) return;
    const normalizedCurrent =
      typeof currentDate === "string" ? currentDate : currentDate || null;
    if (normalizedCurrent === nextDate) return;
    if (!nextDate) {
      operations.patch.execute([{ unset: ["date"] }]);
      return;
    }
    operations.patch.execute([{ set: { date: nextDate } }]);
  };

  const loadEvents = async () => {
    const url = buildCalendarUrl();
    if (!url) {
      setError("Set SANITY_STUDIO_MOTORSPORTREG_ORG_ID to load events.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const [msrResponse, sanityEvents] = await Promise.all([
        fetch(url).then((response) => {
          if (!response.ok) {
            throw new Error(
              `MotorsportReg request failed (${response.status}).`,
            );
          }
          return response.json();
        }),
        client.fetch(SANITY_EVENT_QUERY),
      ]);

      setEvents(mergeEvents(normalizeEvents(msrResponse), sanityEvents || []));
    } catch (err) {
      setError(
        err?.message || "Unable to load MotorsportReg and Sanity events.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSelectedId(storedSelectionId);
  }, [storedSelectionId]);

  useEffect(() => {
    if (readOnly) return;
    loadEvents();
  }, [readOnly]);

  useEffect(() => {
    if (readOnly) return;
    if (!storedSelectionId || !selectedEvent) return;
    const nextValue = buildStoredEventValue(selectedEvent);
    if (haveSameStoredEventValue(value, nextValue)) return;
    onChange(set(nextValue));
  }, [onChange, readOnly, selectedEvent, storedSelectionId, value]);

  const handleFetch = async () => {
    if (readOnly) return;
    await loadEvents();
  };

  const handleSelectId = (id) => {
    if (readOnly) return;
    setSelectedId(id);
    if (!id) {
      onChange(unset());
      updateDate(null);
      return;
    }
    const event = events.find((item) => item.selectionId === id);
    if (event) {
      const eventStart = event?.start || null;
      const eventDate = eventStart ? String(eventStart).slice(0, 10) : null;
      onChange(set(buildStoredEventValue(event)));
      updateDate(eventDate);
    }
  };

  const handleClear = () => {
    if (readOnly) return;
    setSelectedId("");
    onChange(unset());
    updateDate(null);
  };

  return (
    <Stack space={4}>
      <Card padding={3} radius={2} border>
        <Stack space={3}>
          <Flex gap={2} align="center">
            <Box flex={1}>
              <Select
                value={selectedId}
                onChange={(event) => handleSelectId(event.currentTarget.value)}
                disabled={readOnly || isLoading}
              >
                <option value="">Select an event</option>
                {filteredEvents.map((event) => {
                  if (!event?.selectionId) return null;
                  return (
                    <option key={event.selectionId} value={event.selectionId}>
                      {formatEventLabel(event)}
                    </option>
                  );
                })}
              </Select>
            </Box>
            <Button
              aria-label="Refresh events"
              icon={RefreshIcon}
              onClick={handleFetch}
              disabled={readOnly || isLoading}
              tone="primary"
            />
            <Button
              aria-label="Clear selected event"
              icon={TrashIcon}
              onClick={handleClear}
              disabled={readOnly || isLoading || !selectedId}
              tone="critical"
            />
          </Flex>
          {error ? (
            <Card padding={2} radius={2} tone="critical">
              <Text size={1}>{error}</Text>
            </Card>
          ) : null}
          {!filteredEvents.length && !error ? (
            <Text size={1} muted>
              Loading event choices...
            </Text>
          ) : null}
          {filteredEvents.length > 0 ? (
            <Flex
              align="flex-start"
              justify="space-between"
              gap={3}
              wrap="wrap"
            >
              <Text size={0} muted>
                {filteredEvents.length} events available. {msrCount} from MSR,{" "}
                {sanityCount} from Sanity.
              </Text>
              <a
                href="https://motorsportreg.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  padding: 15,
                }}
              >
                <img
                  src={msrLogoSrc}
                  alt="Online registration and event management service for motorsport events powered by MotorsportReg.com"
                  title="Online registration and event management service for motorsport events powered by MotorsportReg.com"
                  style={{ width: 182, height: 32, display: "block" }}
                />
              </a>
            </Flex>
          ) : null}
        </Stack>
      </Card>

      {value ? (
        <Stack space={2}>
          <Box style={{ padding: "2px 0" }}>
            <Text size={1} weight="semibold">
              Selected event for this position
            </Text>
          </Box>
          <Card padding={0} radius={2} border>
            <Box
              padding={3}
              style={{
                backgroundColor: "rgba(31, 122, 63, 0.14)",
                borderRadius: 6,
              }}
            >
              <Flex gap={3} align="flex-start">
                {normalizeImageUrl(value?.imageUrl) ? (
                  <Box
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: 6,
                      overflow: "hidden",
                      backgroundColor: "#f3f3f3",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={normalizeImageUrl(value?.imageUrl)}
                      alt={value?.name || "Selected event"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </Box>
                ) : null}
                <Stack space={2} flex={1}>
                  <Text size={2} weight="semibold">
                    {value?.name || "Selected event"}
                    {selectedEventDateRange
                      ? ` - ${selectedEventDateRange}`
                      : ""}
                  </Text>
                  <Text size={1} muted>
                    Source:{" "}
                    {value?.origin === EVENT_SOURCE.SANITY
                      ? "Sanity event"
                      : "MotorsportReg event"}
                  </Text>
                  <Box
                    as="hr"
                    style={{ border: 0, borderTop: "1px solid", margin: 0 }}
                  />
                  {registrationDateRange ? (
                    <Text size={1} muted>
                      Registration: {registrationDateRange}
                    </Text>
                  ) : null}
                  {[
                    value?.venueName,
                    value?.venueCity,
                    value?.venueRegion,
                  ].filter(Boolean).length ? (
                    <Text size={1} muted>
                      {[value?.venueName, value?.venueCity, value?.venueRegion]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                  ) : null}
                  {previewCoordinateLabel ? (
                    <Text size={1} muted>
                      {previewCoordinateLabel}
                    </Text>
                  ) : null}
                  {value?.url ? (
                    <Box style={{ display: "inline-flex" }}>
                      <Button
                        as="a"
                        href={value.url}
                        target="_blank"
                        rel="noreferrer"
                        mode="default"
                        tone="primary"
                        padding={2}
                        fontSize={1}
                        style={{ width: "auto" }}
                        iconRight={LaunchIcon}
                        text={
                          value?.origin === EVENT_SOURCE.SANITY
                            ? "Open event page"
                            : "Open event in MSR"
                        }
                      />
                    </Box>
                  ) : null}
                </Stack>
              </Flex>
            </Box>
          </Card>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default MotorsportRegEventInput;
