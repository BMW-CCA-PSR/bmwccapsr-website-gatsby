/** @jsxImportSource theme-ui */
import React from "react";
import {
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  isValid,
  parseISO,
} from "date-fns";
import { Text, Flex, Box } from "@theme-ui/components";
import { buildEmailAliasAddress } from "../lib/email-alias";
import { FiClock, FiShare2, FiSlash } from "react-icons/fi";
import {
  FaCalendarPlus,
  FaClock,
  FaDollarSign,
  FaGlobe,
  FaIdBadge,
  FaRoute,
  FaTag,
  FaUsers,
} from "react-icons/fa";
import MapCard from "./map-card";
import {
  getEventEndDate,
  getEventStartDate,
  parseEventDateValue,
} from "../lib/event-dates";

const toGoogleCalendarStamp = (value) =>
  value
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

const escapeIcsText = (value = "") =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

const parseEventDateTimeValue = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  const parsed = parseISO(normalized);
  return isValid(parsed) ? parsed : null;
};

const buildIcsPayload = ({ title, description, location, start, end, url }) => {
  const uid = `${Date.now()}-psr@bmwccapsr.org`;
  const createdAt = toGoogleCalendarStamp(new Date());
  const startAt = toGoogleCalendarStamp(start);
  const endAt = toGoogleCalendarStamp(end);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BMW CCA PSR//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${createdAt}`,
    `DTSTART:${startAt}`,
    `DTEND:${endAt}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    url ? `URL:${escapeIcsText(url)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
};

const DEFAULT_MAPBOX_PUBLIC_TOKEN =
  "pk.eyJ1IjoiZWJveDg2IiwiYSI6ImNpajViaWg4ODAwNWp0aG0zOHlxNjh3ZzcifQ.OxQI3tKViy-IIIOrLABCPQ";

const detailLabelSx = {
  variant: "text.label",
  display: "block",
  color: "gray",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  mb: "0.2rem",
};

const detailValueSx = {
  variant: "styles.p",
  display: "block",
  mt: 0,
  mb: "0.85rem",
  textAlign: "left",
};

const neutralDetailPillSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  px: "0.6rem",
  py: "0.2rem",
  borderRadius: "999px",
  fontSize: "xs",
  fontWeight: "heading",
  bg: "lightgray",
  color: "text",
  mb: "0.85rem",
};

function EventDetails(props) {
  const { startTime, endTime, isPast } = props;
  const address = props.address || {};
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = React.useState(false);
  const calendarMenuRef = React.useRef(null);

  const startDate = getEventStartDate(props);
  const endDate = getEventEndDate(props);
  const start = startDate ? format(startDate, "eeee MMMM do, yyyy") : null;
  const dayCount =
    startDate && endDate
      ? differenceInCalendarDays(endDate, startDate) + 1
      : null;

  const onlineText = [
    props.venueName,
    address.line1,
    address.line2,
    address.city,
    address.state,
    props.website,
    props.onlineLink,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const hasOnlineKeyword = /(zoom|online|remote|virtual|teams|meet)/i.test(
    onlineText,
  );
  const isOnline = Boolean(
    props.onlineEvent || props.onlineLink || hasOnlineKeyword,
  );
  const startDateTime = parseEventDateTimeValue(startTime);
  const endDateTime = parseEventDateTimeValue(endTime);
  const durationMinutes =
    startDateTime && endDateTime
      ? differenceInMinutes(endDateTime, startDateTime)
      : NaN;
  const onlineLengthLabel = Number.isFinite(durationMinutes) && durationMinutes > 0
    ? (() => {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        if (hours && minutes) return `${hours}h ${minutes}m`;
        if (hours) return `${hours}h`;
        return `${minutes}m`;
      })()
    : "TBD";
  const lengthLabel = isOnline
    ? onlineLengthLabel
    : Number.isFinite(dayCount) && dayCount > 0
      ? `${dayCount} day${dayCount === 1 ? "" : "s"}`
      : "TBD";
  const calendarStartDate = startDate;
  const calendarEndDate = endDate;
  const defaultCalendarEndDate = calendarStartDate
    ? new Date(calendarStartDate.getTime() + 2 * 60 * 60 * 1000)
    : null;
  const finalCalendarEndDate =
    calendarEndDate && calendarStartDate && calendarEndDate > calendarStartDate
      ? calendarEndDate
      : defaultCalendarEndDate;

  const eventLocation = [props.venueName, address.city, address.state]
    .filter(Boolean)
    .join(", ");
  const source = String(props.source || "").trim().toLowerCase();
  const isMsrEvent = source === "msr";
  const registerLink = String(props.sourceRegisterLink || "").trim();
  const calendarTitle = props.title || "BMW CCA PSR Event";
  const calendarDescription = `Event: ${props.title || "BMW CCA PSR Event"}${
    start ? ` on ${start}` : ""
  }`;
  const eventUrl =
    registerLink ||
    props.website ||
    props.onlineLink ||
    (typeof window !== "undefined" ? window.location.href : "");
  const registrationOpenAt = parseEventDateValue(props.sourceRegistrationOpenAt);
  const registrationCloseAt = parseEventDateValue(props.sourceRegistrationCloseAt);
  const hasRegistrationWindow = Boolean(registrationOpenAt || registrationCloseAt);
  const nowTime = Date.now();
  const isRegistrationOpen = hasRegistrationWindow
    ? (!registrationOpenAt || nowTime >= registrationOpenAt.getTime()) &&
      (!registrationCloseAt || nowTime <= registrationCloseAt.getTime())
    : null;
  const registrationEndsLabel = registrationCloseAt
    ? format(registrationCloseAt, "MMM d, yyyy")
    : null;
  const useCompactCalendarAction = isMsrEvent && Boolean(registerLink);
  const normalizedVenueName = String(props.venueName || "")
    .trim()
    .toLowerCase();
  const showTrackMapLink =
    normalizedVenueName === "pacific" ||
    normalizedVenueName === "pacific raceways";
  const hasCalendarData =
    Boolean(calendarStartDate) && Boolean(finalCalendarEndDate);
  const googleCalendarUrl = hasCalendarData
    ? `https://calendar.google.com/calendar/render?${new URLSearchParams({
        action: "TEMPLATE",
        text: calendarTitle,
        details: calendarDescription,
        location: eventLocation || "",
        dates: `${toGoogleCalendarStamp(
          calendarStartDate,
        )}/${toGoogleCalendarStamp(finalCalendarEndDate)}`,
      }).toString()}`
    : null;
  const outlookCalendarUrl = hasCalendarData
    ? `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams(
        {
          path: "/calendar/action/compose",
          rru: "addevent",
          subject: calendarTitle,
          body: calendarDescription,
          location: eventLocation || "",
          startdt: calendarStartDate.toISOString(),
          enddt: finalCalendarEndDate.toISOString(),
        },
      ).toString()}`
    : null;

  const mapboxToken =
    process.env.GATSBY_SANITY_MAPBOX_TOKEN ||
    process.env.GATSBY_MAPBOX_TOKEN ||
    DEFAULT_MAPBOX_PUBLIC_TOKEN;
  const hasValidAddress = Boolean(
    !isOnline && address.line1 && address.city && address.state,
  );
  const explicitLatitude = Number.parseFloat(
    String(props?.location?.lat ?? ""),
  );
  const explicitLongitude = Number.parseFloat(
    String(props?.location?.lng ?? ""),
  );
  const hasExplicitCoordinates =
    Number.isFinite(explicitLatitude) && Number.isFinite(explicitLongitude);
  const [resolvedMapCoords, setResolvedMapCoords] = React.useState(
    hasExplicitCoordinates
      ? { latitude: explicitLatitude, longitude: explicitLongitude }
      : null,
  );

  React.useEffect(() => {
    if (!isCalendarMenuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (
        calendarMenuRef.current &&
        !calendarMenuRef.current.contains(event.target)
      ) {
        setIsCalendarMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsCalendarMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isCalendarMenuOpen]);

  React.useEffect(() => {
    if (hasExplicitCoordinates) {
      setResolvedMapCoords({
        latitude: explicitLatitude,
        longitude: explicitLongitude,
      });
      return undefined;
    }

    if (!hasValidAddress || !mapboxToken || typeof window === "undefined") {
      setResolvedMapCoords(null);
      return undefined;
    }

    let isCurrent = true;
    const fullAddress = [
      address.line1,
      address.line2,
      address.city,
      address.state,
    ]
      .filter(Boolean)
      .join(", ");

    const geocodeAddress = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            fullAddress,
          )}.json?access_token=${encodeURIComponent(
            mapboxToken,
          )}&limit=1&autocomplete=false&country=US`,
        );
        if (!response.ok) {
          if (isCurrent) setResolvedMapCoords(null);
          return;
        }
        const payload = await response.json();
        const center = payload?.features?.[0]?.center;
        const longitude = Number.parseFloat(String(center?.[0] ?? ""));
        const latitude = Number.parseFloat(String(center?.[1] ?? ""));
        if (
          isCurrent &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        ) {
          setResolvedMapCoords({ latitude, longitude });
        } else if (isCurrent) {
          setResolvedMapCoords(null);
        }
      } catch (_) {
        if (isCurrent) setResolvedMapCoords(null);
      }
    };

    geocodeAddress();

    return () => {
      isCurrent = false;
    };
  }, [
    address.city,
    address.line1,
    address.line2,
    address.state,
    explicitLatitude,
    explicitLongitude,
    hasExplicitCoordinates,
    hasValidAddress,
    mapboxToken,
  ]);

  const handleDownloadIcs = React.useCallback(() => {
    if (!hasCalendarData || typeof window === "undefined") return;
    const fileBody = buildIcsPayload({
      title: calendarTitle,
      description: calendarDescription,
      location: eventLocation || "",
      start: calendarStartDate,
      end: finalCalendarEndDate,
      url: eventUrl || window.location.href,
    });
    const blob = new Blob([fileBody], {
      type: "text/calendar;charset=utf-8",
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${
      calendarTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "event"
    }.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }, [
    calendarDescription,
    calendarStartDate,
    calendarTitle,
    eventLocation,
    eventUrl,
    finalCalendarEndDate,
    hasCalendarData,
  ]);

  const handleShare = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    const shareUrl = eventUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: calendarTitle,
          text: calendarDescription,
          url: shareUrl,
        });
        return;
      } catch (_) {
        return;
      }
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (_) {
        // no-op
      }
    }
  }, [calendarDescription, calendarTitle, eventUrl]);

  const addressLine = [address.line1, address.line2].filter(Boolean).join(", ");
  const cityStateLine = [address.city, address.state]
    .filter(Boolean)
    .join(", ");
  const iconActionButtonSx = {
    width: "44px",
    height: "42px",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: "lightgray",
    backgroundColor: "lightgray",
    color: "text",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    cursor: "pointer",
    transition: "background-color 150ms ease, color 150ms ease",
    "&:hover": {
      backgroundColor: "#d8d8d8",
    },
  };
  const registerButtonSx = {
    variant: "buttons.primary",
    flex: "1 1 auto",
    minWidth: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    border: 0,
    px: "0.9rem",
    py: "0.5rem",
    fontSize: "xs",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    textDecoration: "none",
    whiteSpace: "nowrap",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    transition: "background-color 0.5s ease-out",
    "&:hover": {
      color: "white",
      bg: "highlight",
    },
  };
  const hasMembershipRequired =
    props.membershipRequired !== undefined && props.membershipRequired !== null;
  const calendarMenu = isCalendarMenuOpen ? (
    <Box
      sx={{
        position: "absolute",
        top: "calc(100% + 6px)",
        right: 0,
        width: "170px",
        border: "1px solid",
        borderColor: "lightgray",
        borderRadius: "10px",
        backgroundColor: "white",
        boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
        overflow: "hidden",
        zIndex: 12,
      }}
    >
      {googleCalendarUrl && (
        <a
          href={googleCalendarUrl}
          rel="noopener noreferrer"
          target="_blank"
          onClick={() => setIsCalendarMenuOpen(false)}
          sx={{
            display: "block",
            px: "0.75rem",
            py: "0.55rem",
            color: "text",
            textDecoration: "none",
            fontSize: "xs",
            borderBottom: "1px solid",
            borderColor: "lightgray",
            "&:hover": { backgroundColor: "lightgray" },
          }}
        >
          Google Calendar
        </a>
      )}
      {outlookCalendarUrl && (
        <a
          href={outlookCalendarUrl}
          rel="noopener noreferrer"
          target="_blank"
          onClick={() => setIsCalendarMenuOpen(false)}
          sx={{
            display: "block",
            px: "0.75rem",
            py: "0.55rem",
            color: "text",
            textDecoration: "none",
            fontSize: "xs",
            borderBottom: "1px solid",
            borderColor: "lightgray",
            "&:hover": { backgroundColor: "lightgray" },
          }}
        >
          Outlook
        </a>
      )}
      <Box
        as="button"
        type="button"
        onClick={() => {
          handleDownloadIcs();
          setIsCalendarMenuOpen(false);
        }}
        disabled={!hasCalendarData}
        sx={{
          width: "100%",
          textAlign: "left",
          px: "0.75rem",
          py: "0.55rem",
          border: 0,
          bg: "transparent",
          color: hasCalendarData ? "text" : "darkgray",
          fontSize: "xs",
          cursor: hasCalendarData ? "pointer" : "not-allowed",
          "&:hover": {
            backgroundColor: hasCalendarData ? "lightgray" : "transparent",
          },
        }}
      >
        iCal (.ics)
      </Box>
    </Box>
  ) : null;

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        borderRadius: "18px",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "black",
        backgroundColor: "background",
      }}
    >
      {isPast && (
        <Box
          sx={{
            width: "100%",
            px: 3,
            py: "0.75rem",
            backgroundColor: "#f5d76e",
            color: "black",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "xs",
            fontWeight: "heading",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
          }}
        >
          <FiClock size={14} aria-hidden="true" />
          <span>This event has already passed</span>
        </Box>
      )}

      <Box
        sx={{
          backgroundColor: "primary",
          px: "1.25rem",
          py: "0.65rem",
          color: "white",
        }}
      >
        <Text sx={{ variant: "text.label", color: "white" }}>
          Event details
        </Text>
      </Box>
      {props.title && (
        <Box sx={{ px: "1.25rem", pt: "0.8rem", pb: "0.15rem" }}>
          <Text
            as="div"
            sx={{ fontSize: "sm", fontWeight: "heading", color: "text" }}
          >
            {props.title}
          </Text>
        </Box>
      )}

      <Flex
        sx={{
          flexDirection: ["column", "column", "row"],
          gap: ["0.5rem", "0.5rem", "1rem"],
          p: 3,
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            alignItems: "flex-start",
          }}
        >
          <Text sx={detailLabelSx}>Date</Text>
          <Text sx={detailValueSx}>{start || "TBD"}</Text>

          {!isMsrEvent && (
            <>
              <Text sx={detailLabelSx}>Length</Text>
              <Box as="span" sx={neutralDetailPillSx}>
                <Box as="span" sx={{ display: "inline-flex", lineHeight: 0 }}>
                  <FaClock size={12} aria-hidden="true" />
                </Box>
                <Box as="span">{lengthLabel}</Box>
              </Box>
            </>
          )}

          <Text sx={detailLabelSx}>Cost</Text>
          <Box as="span" sx={neutralDetailPillSx}>
            {!props.cost || props.cost === 0 ? (
              <Box
                as="span"
                sx={{
                  position: "relative",
                  display: "inline-flex",
                  width: "12px",
                  height: "12px",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 0,
                }}
              >
                <FaDollarSign size={12} aria-hidden="true" />
                <FiSlash
                  size={16}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "-2px",
                    left: "-2px",
                    color: "red",
                  }}
                />
              </Box>
            ) : (
              <Box as="span" sx={{ display: "inline-flex", lineHeight: 0 }}>
                <FaTag size={12} aria-hidden="true" />
              </Box>
            )}
            <Box as="span">
              {!props.cost || props.cost === 0 ? "Free" : `$${props.cost}`}
            </Box>
          </Box>
          {isMsrEvent && hasRegistrationWindow && (
            <>
              <Text sx={detailLabelSx}>Status</Text>
              <Box
                as="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  px: "0.6rem",
                  py: "0.18rem",
                  borderRadius: "999px",
                  bg: isRegistrationOpen ? "#e8f7ec" : "#fde8e8",
                  color: isRegistrationOpen ? "#1f7a3f" : "#9a1f1f",
                  fontSize: "xs",
                  fontWeight: "heading",
                  mb: "0.55rem",
                }}
              >
                <Box
                  as="span"
                  sx={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "999px",
                    bg: isRegistrationOpen ? "#1f7a3f" : "#9a1f1f",
                  }}
                />
                {isRegistrationOpen ? "Open" : "Closed"}
              </Box>
              {registrationEndsLabel && (
                <>
                  <Text sx={detailLabelSx}>Register by</Text>
                  <Text sx={{ ...detailValueSx, mb: "0.65rem" }}>
                    {registrationEndsLabel}
                  </Text>
                </>
              )}
            </>
          )}
          {isMsrEvent && (
            <>
              <Text sx={detailLabelSx}>Signups</Text>
              <Text sx={detailValueSx}>
                {Number.isFinite(Number(props.sourceRegistrationCount))
                  ? Number(props.sourceRegistrationCount)
                  : 0}
              </Text>
            </>
          )}
          {hasMembershipRequired && (
            <>
              <Text sx={detailLabelSx}>Membership required</Text>
              {props.membershipRequired ? (
                <Box
                  as="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    px: "0.65rem",
                    py: "0.14rem",
                    borderRadius: "999px",
                    bg: "#f2cf3a",
                    color: "#2b1f00",
                    fontSize: "sm",
                    mb: "0.85rem",
                  }}
                >
                  <Box as="span" sx={{ display: "inline-flex", lineHeight: 0 }}>
                    <FaIdBadge size={12} aria-hidden="true" />
                  </Box>
                  <Box as="span" sx={{ fontWeight: "heading" }}>
                    Yes
                  </Box>
                  <Box
                    as="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: "0.78em",
                      fontStyle: "italic",
                      color: "inherit",
                      lineHeight: 1.1,
                    }}
                  >
                    - active BMW CCA membership required
                  </Box>
                </Box>
              ) : (
                <Box
                  as="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    px: "0.65rem",
                    py: "0.1rem",
                    borderRadius: "999px",
                    bg: "lightgray",
                    color: "text",
                    fontSize: "sm",
                    mb: "0.85rem",
                  }}
                >
                  <Box as="span" sx={{ display: "inline-flex", lineHeight: 0 }}>
                    <FaUsers size={14} aria-hidden="true" />
                  </Box>
                  <Box
                    as="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.2rem",
                    }}
                  >
                    <Box as="span" sx={{ fontWeight: "heading" }}>
                      No
                    </Box>
                    <Box
                      as="span"
                      sx={{ fontSize: "0.78em", fontStyle: "italic" }}
                    >
                      - anyone can volunteer
                    </Box>
                  </Box>
                </Box>
              )}
            </>
          )}

          {props.poc && (props.poc.name || (props.poc.contact && props.poc.contact.length > 0)) && (
            <>
              <Text sx={detailLabelSx}>Point of contact</Text>
              {props.poc.name && (
                <Text sx={detailValueSx}>{props.poc.name}</Text>
              )}
              {props.poc.contact && props.poc.contact.map((entry, i) => {
                if (entry._type === 'emailAliasReferenceRecipient' && entry.alias?.name) {
                  const aliasEmail = buildEmailAliasAddress(entry.alias.name);
                  return (
                    <Text key={i} sx={detailValueSx}>
                      <a href={`mailto:${aliasEmail}`}>{aliasEmail}</a>
                    </Text>
                  )
                }
                if (entry._type === 'emailAliasAddressRecipient' && entry.email) {
                  return (
                    <Text key={i} sx={detailValueSx}>
                      <a href={`mailto:${entry.email}`}>{entry.email}</a>
                    </Text>
                  )
                }
                return null
              })}
            </>
          )}
          {!isMsrEvent && props.website && (
            <>
              <Text sx={detailLabelSx}>Website</Text>
              <Text
                variant="styles.p"
                sx={{
                  mt: 0,
                  mb: "0.85rem",
                  textAlign: "left",
                  width: "100%",
                  wordWrap: "break-word",
                }}
              >
                <a href={props.website}>Link</a>
              </Text>
            </>
          )}
          <Flex
            sx={{
              mt: "auto",
              width: "100%",
              alignItems: "stretch",
              gap: "0.5rem",
            }}
          >
            {useCompactCalendarAction ? (
              <a
                href={registerLink}
                rel="noopener noreferrer"
                target="_blank"
                sx={registerButtonSx}
              >
                <Flex
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                  }}
                >
                  <FaGlobe size={14} aria-hidden="true" />
                  Register
                </Flex>
              </a>
            ) : (
              <Box ref={calendarMenuRef} sx={{ position: "relative", flex: "1 1 auto" }}>
                <Box
                  as="button"
                  type="button"
                  onClick={() =>
                    hasCalendarData && setIsCalendarMenuOpen((prev) => !prev)
                  }
                  aria-label="Add to calendar"
                  title="Add to calendar"
                  disabled={!hasCalendarData}
                  sx={{
                    ...registerButtonSx,
                    width: "100%",
                    height: "42px",
                    minHeight: "42px",
                    py: 0,
                    cursor: hasCalendarData ? "pointer" : "not-allowed",
                    opacity: hasCalendarData ? 1 : 0.6,
                  }}
                >
                  Add to calendar
                </Box>
                {calendarMenu}
              </Box>
            )}
            {useCompactCalendarAction && (
              <Box ref={calendarMenuRef} sx={{ position: "relative" }}>
                <Box
                  as="button"
                  type="button"
                  onClick={() =>
                    hasCalendarData && setIsCalendarMenuOpen((prev) => !prev)
                  }
                  aria-label="Add to calendar"
                  title="Add to calendar"
                  disabled={!hasCalendarData}
                  sx={{
                    ...iconActionButtonSx,
                    opacity: hasCalendarData ? 1 : 0.6,
                    cursor: hasCalendarData ? "pointer" : "not-allowed",
                  }}
                >
                  <FaCalendarPlus size={16} aria-hidden="true" />
                </Box>
                {calendarMenu}
              </Box>
            )}
            <Box
              as="button"
              type="button"
              aria-label="Share event"
              title="Share event"
              onClick={handleShare}
              sx={iconActionButtonSx}
            >
              <FiShare2 size={16} aria-hidden="true" />
            </Box>
          </Flex>
        </Box>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {isOnline ? (
            <>
              <Text sx={detailLabelSx}>Online event</Text>
              <Text
                variant="styles.p"
                sx={{ mt: 0, mb: "0.65rem", textAlign: "left" }}
              >
                This event is held online. Please reach out to the event
                organizer for joining information.
              </Text>
              {props.onlineLink && (
                <>
                  <Text sx={detailLabelSx}>Link</Text>
                  <Text
                    variant="styles.p"
                    sx={{
                      mt: 0,
                      mb: "0.65rem",
                      textAlign: "left",
                      width: "100%",
                      wordWrap: "break-word",
                    }}
                  >
                    <a href={props.onlineLink}>Join online</a>
                  </Text>
                </>
              )}
            </>
          ) : (
            <>
              {props.venueName && (
                <>
                  <Text sx={detailLabelSx}>Venue</Text>
                  <Text sx={detailValueSx}>{props.venueName}</Text>
                </>
              )}

              {(addressLine || cityStateLine) && (
                <>
                  <Text sx={detailLabelSx}>Address</Text>
                  {addressLine && <Text sx={detailValueSx}>{addressLine}</Text>}
                  {cityStateLine && (
                    <Text
                      sx={{ ...detailValueSx, textTransform: "capitalize" }}
                    >
                      {cityStateLine}
                    </Text>
                  )}
                </>
              )}

              {showTrackMapLink && (
                <Box
                  as="a"
                  href="https://pacificraceways.com/road-course-track-map/"
                  rel="noopener noreferrer"
                  target="_blank"
                  sx={{
                    mt: "0.25rem",
                    mb: "0.65rem",
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    px: "0.9rem",
                    minHeight: "42px",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: "lightgray",
                    bg: "lightgray",
                    color: "text",
                    textDecoration: "none",
                    fontSize: "xs",
                    fontWeight: "heading",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    transition: "background-color 150ms ease",
                    "&:hover": {
                      backgroundColor: "#d8d8d8",
                    },
                  }}
                >
                  <FaRoute size={13} aria-hidden="true" />
                  View Track Map
                </Box>
              )}

              {!isOnline && resolvedMapCoords && (
                <Box
                  sx={{
                    mt: "0.35rem",
                    alignSelf: "stretch",
                    flex: ["0 0 auto", "0 0 auto", "1 1 auto"],
                    height: ["200px", "210px", "260px"],
                  }}
                >
                  <MapCard
                    latitude={resolvedMapCoords.latitude}
                    longitude={resolvedMapCoords.longitude}
                    title={props.title}
                    token={mapboxToken}
                    showZoomControls={false}
                    height={["200px", "210px", "260px"]}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

export default EventDetails;
