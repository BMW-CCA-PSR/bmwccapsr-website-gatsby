/** @jsxImportSource theme-ui */
import { format, formatDistanceStrict } from "date-fns";
import React from "react";
import SanityImage from "gatsby-plugin-sanity-image";
import PortableText from "./portableText";
import { Link } from "gatsby";
import VerticalLine from "./vertical-line";
import { Box, Heading, Text, Flex } from "@theme-ui/components";
import RelatedContent from "./related-content";
import EventDetails from "./event-detail";
import { randomGenerator } from "../lib/helpers";
import { BoxAd } from "./ads";
import ContentContainer from "./content-container";
import { BoxIcon } from "./box-icons";
import { FiClock, FiShare2 } from "react-icons/fi";
import { FaCalendarPlus } from "react-icons/fa";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";

const parseCalendarDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

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

function EventPage(props) {
  const {
    _rawBody,
    _updatedAt,
    category,
    title,
    mainImage,
    startTime,
    next,
    prev,
    boxes,
    endTime,
    website,
    onlineLink,
    venueName,
    address,
  } = props;
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = React.useState(false);
  const calendarMenuRef = React.useRef(null);
  const isPast = startTime ? new Date(startTime) < new Date() : false;
  const startInDays = startTime
    ? formatDistanceStrict(new Date(startTime), new Date(), { addSuffix: true })
    : null;
  var start = startTime && format(new Date(startTime), "MMMM do, yyyy");
  var updated = _updatedAt && format(new Date(_updatedAt), "MMMM do, yyyy");
  const cat = category.title;
  const categoryFilterLink = cat
    ? `/events/?category=${encodeURIComponent(cat)}&active=1`
    : "/events/?active=1";
  const randomAdPosition = randomGenerator(0, boxes.edges.length - 1);
  const randomizedAd = boxes.edges[randomAdPosition].node;
  const relatedEvents = React.useMemo(() => {
    const now = Date.now();
    return [next, prev].filter((event) => {
      if (!event?.startTime) return false;
      const timestamp = Date.parse(event.startTime);
      return Number.isFinite(timestamp) && timestamp >= now;
    });
  }, [next, prev]);

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

  const calendarStartDate = parseCalendarDate(startTime);
  const calendarEndDate = parseCalendarDate(endTime);
  const defaultCalendarEndDate = calendarStartDate
    ? new Date(calendarStartDate.getTime() + 2 * 60 * 60 * 1000)
    : null;
  const finalCalendarEndDate =
    calendarEndDate && calendarStartDate && calendarEndDate > calendarStartDate
      ? calendarEndDate
      : defaultCalendarEndDate;
  const eventLocation = [venueName, address?.city, address?.state]
    .filter(Boolean)
    .join(", ");
  const calendarTitle = title || "BMW CCA PSR Event";
  const calendarDescription = `Event: ${title || "BMW CCA PSR Event"}${
    start ? ` on ${start}` : ""
  }`;
  const eventUrl =
    website ||
    onlineLink ||
    (typeof window !== "undefined" ? window.location.href : "");
  const hasCalendarData =
    Boolean(calendarStartDate) && Boolean(finalCalendarEndDate);
  const googleCalendarUrl = hasCalendarData
    ? `https://calendar.google.com/calendar/render?${new URLSearchParams({
        action: "TEMPLATE",
        text: calendarTitle,
        details: calendarDescription,
        location: eventLocation || "",
        dates: `${toGoogleCalendarStamp(
          calendarStartDate
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
        }
      ).toString()}`
    : null;

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

  const actionButtonSx = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    bg: "lightgray",
    color: "text",
    border: "1px solid",
    borderColor: "gray",
    borderRadius: "8px",
    px: "0.65rem",
    py: "0.25rem",
    fontSize: "xs",
    fontWeight: "heading",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    cursor: "pointer",
    textDecoration: "none",
    "&:hover": {
      bg: "highlight",
      color: "text",
    },
  };
  return (
    <section>
      <ContentContainer
        sx={{
          display: "flex",
          pl: ["16px", "16px", "50px", "100px"],
          pr: ["16px", "16px", "50px", "100px"],
          pt: ["6.5rem", "6.5rem", "10rem", "10rem"],
          pb: "1rem",
          width: "100%",
          flexDirection: "row",
          mx: "auto",
        }}
      >
        <Flex
          sx={{
            //pr: "16px",
            flexDirection: "column",
            position: "relative",
            mt: isPast ? ["3rem", "3rem", 0, 0] : 0,
          }}
        >
          {isPast && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                transform: "translateY(calc(-100% - 0.9rem))",
                zIndex: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "100%",
                bg: "#f5d76e",
                color: "black",
                borderRadius: "10px",
                px: "0.8rem",
                py: "0.42rem",
                fontSize: "xs",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontWeight: "heading",
                gap: "0.45rem",
              }}
            >
              <FiClock size={14} aria-hidden="true" />
              <span>This event has already passed</span>
            </Box>
          )}
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              mb: "0.5rem",
              width: "fit-content",
            }}
          >
            <Text variant="text.label" sx={{ display: "inline-block" }}>
              <Link
                to="/events/"
                sx={{
                  textDecoration: "none",
                  color: "text",
                  display: "inline-flex",
                  alignItems: "center",
                  px: "0.15em",
                  mx: "-0.15em",
                }}
              >
                Events
              </Link>
              <Text as="span" sx={{ px: "0.35em" }}>
                /
              </Text>
              {cat ? (
                <Link
                  to={categoryFilterLink}
                  sx={{
                    textDecoration: "none",
                    color: "text",
                    display: "inline-flex",
                    alignItems: "center",
                    px: "0.15em",
                    mx: "-0.15em",
                  }}
                >
                  {cat}
                </Link>
              ) : (
                "All"
              )}
            </Text>
          </Box>
          <Heading
            variant="styles.h1"
            sx={{ mt: 0, position: "relative", zIndex: 1 }}
          >
            {title}
            <BoxIcon
              as="span"
              sx={{
                display: "inline-grid",
                ml: "0.5rem",
                verticalAlign: "middle",
              }}
            />
          </Heading>
          <Text sx={{ variant: "styles.h3", py: "1rem" }}>
            {start}
            {startInDays ? ` | ${startInDays}` : ""}
          </Text>
          <Box
            sx={{
              height: "1px",
              backgroundColor: "lightgray",
              mb: "0.7rem",
            }}
          />
          <Flex
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              flexWrap: "wrap",
              mb: "0.35rem",
            }}
          >
            <Text sx={{ variant: "styles.p", mb: 0 }}>
              Last updated: {updated}
            </Text>
            <Flex sx={{ alignItems: "center", gap: "0.5rem", ml: "auto" }}>
              <Box ref={calendarMenuRef} sx={{ position: "relative" }}>
                <Box
                  as="button"
                  type="button"
                  onClick={() => setIsCalendarMenuOpen((prev) => !prev)}
                  aria-label="Add to calendar"
                  title="Add to calendar"
                  sx={actionButtonSx}
                >
                  <FaCalendarPlus size={13} aria-hidden="true" />
                  Add to calendar
                </Box>
                {isCalendarMenuOpen && (
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
                          backgroundColor: hasCalendarData
                            ? "lightgray"
                            : "transparent",
                        },
                      }}
                    >
                      iCal (.ics)
                    </Box>
                  </Box>
                )}
              </Box>
              <Box
                as="button"
                type="button"
                aria-label="Share"
                title="Share"
                onClick={handleShare}
                sx={actionButtonSx}
              >
                <FiShare2 size={13} aria-hidden="true" />
                Share
              </Box>
            </Flex>
          </Flex>
          {mainImage && mainImage.asset && (
            <div
              sx={{
                maxHeight: "500px",
                overflow: "hidden",
                borderRadius: "18px",
              }}
            >
              <SanityImage
                {...mainImage}
                width={1440}
                {...nonDraggableImageProps}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  ...nonDraggableImageSx,
                }}
              />
            </div>
          )}
          {_rawBody && <PortableText body={_rawBody} boxed />}
          <EventDetails {...props} isPast={isPast} />
        </Flex>
        <div
          sx={
            relatedEvents.length > 0
              ? {
                  display: ["none", "none", "flex"],
                  mx: "auto",
                }
              : { display: "none" }
          }
        >
          <VerticalLine height="600" />
          <div
            sx={{
              mx: "auto",
            }}
          >
            <BoxAd {...randomizedAd} />
            <Heading variant="styles.h3" sx={{ my: "1rem" }}>
              More Events
            </Heading>
            {relatedEvents.map((event) => (
              <RelatedContent key={event.id} {...event} />
            ))}
          </div>
        </div>
      </ContentContainer>
    </section>
  );
}

export default EventPage;
