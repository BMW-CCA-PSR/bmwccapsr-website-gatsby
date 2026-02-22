import React, { useEffect, useMemo, useState } from "react";
import { LaunchIcon, RefreshIcon, TrashIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Select, Stack, Text } from "@sanity/ui";
import { set, unset, useDocumentOperation, useFormValue } from "sanity";

const API_BASE =
  process.env.SANITY_STUDIO_MOTORSPORTREG_API_BASE ||
  "https://api.motorsportreg.com";
const ORG_ID =
  process.env.SANITY_STUDIO_MOTORSPORTREG_ORG_ID ||
  "E459757B-AF0D-6403-449F2BFCAF307273";

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

const buildEventValue = (event) => {
  const venue = event?.venue || {};
  const { latitude, longitude } = extractEventCoordinates(event);
  const rawImageUrl =
    event?.image?.standard ||
    event?.image?.preview ||
    event?.image?.url ||
    event?.image?.original ||
    null;
  return {
    _type: "motorsportRegEvent",
    eventId: event?.id ? String(event.id) : null,
    name: event?.name || event?.title || null,
    start: event?.start || event?.start_date || null,
    end: event?.end || event?.end_date || null,
    url: event?.detailuri || event?.detail_url || event?.url || null,
    venueName: venue?.name || null,
    venueCity: venue?.city || null,
    venueRegion: venue?.region || venue?.state || null,
    latitude,
    longitude,
    imageUrl: normalizeImageUrl(rawImageUrl),
    organizationId: ORG_ID || null,
  };
};

const getEventId = (event) =>
  event?.id ? String(event.id) : event?.uri || event?.detailuri || null;

const formatEventLabel = (event) => {
  const name = event?.name || event?.title || "Untitled event";
  const date = event?.start || event?.start_date || null;
  const venue = event?.venue?.name || "";
  const city = event?.venue?.city || "";
  const parts = [];
  if (date) parts.push(date.slice(0, 10));
  parts.push(name);
  if (venue || city) parts.push([venue, city].filter(Boolean).join(", "));
  return parts.join(" — ");
};

const formatEventTimestamp = (value) => {
  if (!value) return null;
  const normalized = value.replace("T", " ");
  return normalized.length > 16 ? normalized.slice(0, 16) : normalized;
};

const formatEventDateRange = (start, end) => {
  if (!start) return null;
  const startLabel = formatEventTimestamp(start);
  const endLabel = end ? formatEventTimestamp(end) : null;
  if (!endLabel || endLabel === startLabel) return startLabel;
  return `${startLabel} – ${endLabel}`;
};

const MotorsportRegEventInput = (props) => {
  const { value, onChange, readOnly } = props;
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(value?.eventId || "");
  const documentId = useFormValue(["_id"]);
  const documentType = useFormValue(["_type"]);
  const currentDate = useFormValue(["date"]);
  const publishedId =
    typeof documentId === "string" ? documentId.replace(/^drafts\./, "") : null;
  const operations = useDocumentOperation(
    publishedId || "",
    documentType || ""
  );

  const filteredEvents = useMemo(() => events, [events]);
  const selectedEvent = useMemo(
    () => events.find((item) => getEventId(item) === selectedId) || null,
    [events, selectedId]
  );
  const selectedEventCoordinates = useMemo(
    () => extractEventCoordinates(selectedEvent),
    [selectedEvent]
  );
  const valueCoordinates = useMemo(
    () => extractEventCoordinates(value),
    [value]
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
    previewLongitude
  );

  useEffect(() => {
    setSelectedId(value?.eventId || "");
  }, [value?.eventId]);

  useEffect(() => {
    if (readOnly) return;
    if (!value?.eventId || !selectedEvent) return;
    const currentLatitude = parseCoordinate(value?.latitude);
    const currentLongitude = parseCoordinate(value?.longitude);
    const nextLatitude = selectedEventCoordinates?.latitude;
    const nextLongitude = selectedEventCoordinates?.longitude;
    if (nextLatitude === null && nextLongitude === null) return;
    if (
      currentLatitude === nextLatitude &&
      currentLongitude === nextLongitude
    ) {
      return;
    }
    onChange(set(buildEventValue(selectedEvent)));
  }, [
    onChange,
    readOnly,
    selectedEvent,
    selectedEventCoordinates?.latitude,
    selectedEventCoordinates?.longitude,
    value?.eventId,
    value?.latitude,
    value?.longitude,
  ]);

  useEffect(() => {
    if (readOnly) return;
    const url = buildCalendarUrl();
    if (!url) {
      setError("Set SANITY_STUDIO_MOTORSPORTREG_ORG_ID to load events.");
      return;
    }
    setError("");
    setIsLoading(true);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`MotorsportReg request failed (${response.status}).`);
        }
        return response.json();
      })
      .then((payload) => {
        setEvents(normalizeEvents(payload));
      })
      .catch((err) => {
        setError(err?.message || "Unable to load MotorsportReg events.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [readOnly]);

  const handleFetch = async () => {
    const url = buildCalendarUrl();
    if (!url) {
      setError("Set SANITY_STUDIO_MOTORSPORTREG_ORG_ID to load events.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`MotorsportReg request failed (${response.status}).`);
      }
      const payload = await response.json();
      setEvents(normalizeEvents(payload));
    } catch (err) {
      setError(err?.message || "Unable to load MotorsportReg events.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectId = (id) => {
    if (readOnly) return;
    setSelectedId(id);
    if (!id) {
      onChange(unset());
      updateDate(null);
      return;
    }
    const event = events.find((item) => getEventId(item) === id);
    if (event) {
      const eventStart = event?.start || event?.start_date || null;
      const eventDate = eventStart ? String(eventStart).slice(0, 10) : null;
      onChange(set(buildEventValue(event)));
      updateDate(eventDate);
    }
  };

  const handleClear = () => {
    if (readOnly) return;
    setSelectedId("");
    onChange(unset());
    updateDate(null);
  };

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
                  const id = getEventId(event);
                  if (!id) return null;
                  return (
                    <option key={id} value={id}>
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
          {!events.length && !error ? (
            <Text size={1} muted>
              Loading MotorsportReg events...
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
                {filteredEvents.length} events available.
              </Text>
              <a
                href="https://motorsportreg.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: 6,
                }}
              >
                <img
                  src="https://msr-hotlink.s3.amazonaws.com/default/msr-logo-default@2x.png"
                  alt="Online registration and event management service for motorsport events powered by MotorsportReg.com"
                  title="Online registration and event management service for motorsport events powered by MotorsportReg.com"
                  style={{ width: 200, height: 31, display: "block" }}
                />
              </a>
            </Flex>
          ) : null}
        </Stack>
      </Card>

      {value ? (
        <Card padding={3} radius={2} border>
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
                  alt={value?.name || "Selected MotorsportReg event"}
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
                {value?.name || "Selected MotorsportReg event"}
              </Text>
              <Box
                as="hr"
                style={{ border: 0, borderTop: "1px solid", margin: 0 }}
              />
              {formatEventDateRange(value?.start, value?.end) ? (
                <Text size={1} muted>
                  {formatEventDateRange(value?.start, value?.end)}
                </Text>
              ) : null}
              {[value?.venueName, value?.venueCity, value?.venueRegion].filter(
                Boolean
              ).length ? (
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
                    text="Open event in MSR"
                  />
                </Box>
              ) : null}
            </Stack>
          </Flex>
        </Card>
      ) : null}
    </Stack>
  );
};

export default MotorsportRegEventInput;
