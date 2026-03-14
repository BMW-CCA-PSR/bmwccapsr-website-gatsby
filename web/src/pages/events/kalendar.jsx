/** @jsxImportSource theme-ui */
import React, { useEffect, useMemo, useState } from "react";
import { graphql, Link } from "gatsby";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Box, Button, Card, Flex, Heading, Text } from "@theme-ui/components";
import { FaCalendarAlt, FaRegCalendarCheck } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight, FiDownload } from "react-icons/fi";
import GraphQLErrorList from "../../components/graphql-error-list";
import Seo from "../../components/seo";
import Layout from "../../containers/layout";
import ContentContainer from "../../components/content-container";
import { BoxIcon } from "../../components/box-icons";
import StylizedLandingHeader from "../../components/stylized-landing-header";
import { imageUrlFor } from "../../lib/image-url";
import {
  filterOutDocsWithoutSlugs,
  getEventsUrl,
  mapEdgesToNodes,
} from "../../lib/helpers";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CALENDAR_PREVIEW_WIDTH = 220;

const toDayKey = (value) => format(value, "yyyy-MM-dd");

const toCalendarDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const toIcsStamp = (value) =>
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

const buildMonthIcsPayload = ({ events, visibleMonth }) => {
  const createdAt = toIcsStamp(new Date());
  const eventLines = events.flatMap((event, index) => {
    const start = toCalendarDate(event?.startTime);
    if (!start) return [];
    const end =
      toCalendarDate(event?.endTime) ||
      new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const slug = event?.slug?.current;
    const url = slug ? `https://bmwccapsr.org${getEventsUrl(slug)}` : null;
    const location = event?.onlineEvent
      ? "Online"
      : [event?.venueName, event?.address?.city, event?.address?.state]
          .filter(Boolean)
          .join(", ") || "TBA";
    const description = [
      event?.category?.title,
      event?.onlineEvent ? "Online event" : null,
      url,
    ]
      .filter(Boolean)
      .join("\n");
    const uid = `${format(visibleMonth, "yyyyMM")}-${index}-${
      event?.id || "event"
    }@bmwccapsr.org`;

    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${createdAt}`,
      `DTSTART:${toIcsStamp(start)}`,
      `DTEND:${toIcsStamp(end)}`,
      `SUMMARY:${escapeIcsText(event?.title || "Chapter Event")}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText(location)}`,
      url ? `URL:${escapeIcsText(url)}` : null,
      "END:VEVENT",
    ].filter(Boolean);
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BMW CCA PSR//Events Kalendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...eventLines,
    "END:VCALENDAR",
  ].join("\r\n");
};

export const query = graphql`
  query EventCalendarPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    events: allSanityEvent(
      sort: { fields: [startTime], order: ASC }
      filter: { slug: { current: { ne: null } } }
    ) {
      edges {
        node {
          id
          title
          startTime
          endTime
          mainImage {
            alt
            asset {
              _id
            }
          }
          slug {
            current
          }
          category {
            title
          }
          venueName
          address {
            city
            state
          }
          onlineEvent
        }
      }
    }
  }
`;

const EventCalendarPage = ({ data, errors }) => {
  const site = data?.site;
  const menuItems = site?.navMenu?.items || [];
  const events = useMemo(
    () =>
      (data?.events ? mapEdgesToNodes(data.events) : []).filter(
        filterOutDocsWithoutSlugs
      ),
    [data?.events]
  );
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date())
  );
  const [hoverPreview, setHoverPreview] = useState(null);

  const monthRange = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth));
    const end = endOfWeek(endOfMonth(visibleMonth));
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  const eventsByDay = useMemo(() => {
    const grouped = new Map();
    events.forEach((event) => {
      if (!event?.startTime) return;
      const eventDate = parseISO(event.startTime);
      const key = toDayKey(eventDate);
      const next = grouped.get(key) || [];
      next.push(event);
      next.sort(
        (a, b) => Date.parse(a?.startTime || 0) - Date.parse(b?.startTime || 0)
      );
      grouped.set(key, next);
    });
    return grouped;
  }, [events]);

  const visibleMonthEvents = useMemo(
    () =>
      events.filter((event) => {
        if (!event?.startTime) return false;
        return isSameMonth(parseISO(event.startTime), visibleMonth);
      }),
    [events, visibleMonth]
  );

  useEffect(() => {
    const clearPreview = () => setHoverPreview(null);
    window.addEventListener("scroll", clearPreview, true);
    window.addEventListener("resize", clearPreview);
    return () => {
      window.removeEventListener("scroll", clearPreview, true);
      window.removeEventListener("resize", clearPreview);
    };
  }, []);

  const handleDownloadMonthCalendar = () => {
    if (typeof window === "undefined" || !visibleMonthEvents.length) return;
    const fileBody = buildMonthIcsPayload({
      events: visibleMonthEvents,
      visibleMonth,
    });
    const blob = new Blob([fileBody], {
      type: "text/calendar;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bmw-cca-psr-events-${format(
      visibleMonth,
      "MMMM-yyyy"
    ).toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (errors) {
    return (
      <Layout navMenuItems={menuItems}>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo title="Events Kalendar" description="BMW CCA PSR Events Kalendar" />
      <ContentContainer
        sx={{
          pl: ["16px", "16px", "50px", "100px"],
          pr: ["16px", "16px", "50px", "100px"],
          pt: ["6.5rem", "6.5rem", "10rem", "10rem"],
          pb: "2rem",
        }}
      >
        <StylizedLandingHeader
          word="Events"
          color="primary"
          bleedTop="65px"
          minHeight="0px"
          topInset={["11rem", "12rem", "15rem", "17rem"]}
          patternViewportInset={[
            "0 0 1rem 0",
            "0 0 1.25rem 0",
            "0 0 1.6rem 0",
            "0 0 2rem 0",
          ]}
          rowCount={22}
          rowRepeatCount={30}
          textFontSize={["30px", "36px", "46px", "56px"]}
          rowHeight={["1.55rem", "1.8rem", "2.25rem", "2.7rem"]}
          rowGap={["0.08rem", "0.1rem", "0.12rem", "0.16rem"]}
          rowOverflow="visible"
          textLineHeight={0.94}
          textTranslateY="0%"
          patternInset={["-44% -70%", "-44% -70%", "-46% -58%", "-48% -52%"]}
          patternTransform={[
            "translateY(-4%) rotate(-45deg) scale(1.08)",
            "translateY(-4%) rotate(-45deg) scale(1.08)",
            "translateY(-2%) rotate(-45deg) scale(1.1)",
            "translateY(-2%) rotate(-45deg) scale(1.12)",
          ]}
          rowContents={["EVENTS"]}
        />
        <Box sx={{ position: "relative", height: 0, mb: 0 }}>
          <Box
            sx={{
              position: "absolute",
              top: "-1.2rem",
              left: 0,
              zIndex: 2,
              width: "fit-content",
            }}
          >
            <Text variant="text.label" sx={{ display: "inline-block" }}>
              <Link
                to="/events"
                sx={{
                  textDecoration: "none",
                  color: "text",
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  px: "0.15em",
                  mx: "-0.15em",
                }}
              >
                Events
              </Link>
              <Text as="span" sx={{ px: "0.35em" }}>
                /
              </Text>
              Kalendar
            </Text>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            pb: "0.35rem",
          }}
        >
          <Heading sx={{ variant: "styles.h1", mb: 0 }}>
            Events{" "}
            <Box as="span" sx={{ color: "secondary" }}>
              Kalendar
            </Box>
          </Heading>
          <BoxIcon />
        </Box>
        <Text
          sx={{
            variant: "styles.p",
            fontSize: "16pt",
            color: "text",
            maxWidth: "820px",
            mb: "3rem",
          }}
        >
          Browse the Chapter event schedule in a traditional month view. Select
          a month to see upcoming drives, meetings, clinics, and social events
          by day.
        </Text>

        <Card
          sx={{
            mt: "1.25rem",
            border: "1px solid",
            borderColor: "black",
            borderRadius: "18px",
            overflow: "hidden",
            bg: "background",
          }}
        >
          <Flex
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              bg: "primary",
              color: "white",
              px: ["0.9rem", "1rem", "1.2rem"],
              py: ["0.8rem", "0.9rem", "1rem"],
              borderBottom: "1px solid",
              borderBottomColor: "black",
              flexWrap: "wrap",
            }}
          >
            <Flex
              sx={{
                flex: ["1 1 100%", "1 1 auto"],
                width: ["100%", "auto"],
                justifyContent: "center",
                alignItems: "center",
                gap: "0.65rem",
              }}
            >
              <Button
                type="button"
                onClick={() =>
                  setVisibleMonth((current) => subMonths(current, 1))
                }
                sx={{
                  variant: "buttons.primary",
                  bg: "background",
                  color: "text",
                  border: "1px solid",
                  borderColor: "gray",
                  px: "0.8rem",
                  py: "0.35rem",
                  "&:hover": { bg: "highlight", color: "text" },
                }}
              >
                <FiChevronLeft size={18} aria-hidden="true" />
              </Button>
              <FaCalendarAlt size={22} />
              <Heading as="h2" sx={{ variant: "styles.h3", m: 0 }}>
                {format(visibleMonth, "MMMM yyyy")}
              </Heading>
              <Button
                type="button"
                onClick={() =>
                  setVisibleMonth((current) => addMonths(current, 1))
                }
                sx={{
                  variant: "buttons.primary",
                  bg: "background",
                  color: "text",
                  border: "1px solid",
                  borderColor: "gray",
                  px: "0.8rem",
                  py: "0.35rem",
                  "&:hover": { bg: "highlight", color: "text" },
                }}
              >
                <FiChevronRight size={18} aria-hidden="true" />
              </Button>
            </Flex>
            <Flex
              sx={{
                alignItems: "center",
                gap: "0.5rem",
                ml: ["0", "auto"],
                width: ["100%", "auto"],
                justifyContent: ["center", "flex-end"],
              }}
            >
              <Button
                type="button"
                onClick={handleDownloadMonthCalendar}
                disabled={!visibleMonthEvents.length}
                sx={{
                  variant: "buttons.primary",
                  bg: "background",
                  color: "text",
                  border: "1px solid",
                  borderColor: "gray",
                  px: "0.85rem",
                  py: "0.35rem",
                  fontSize: "xs",
                  "&:hover": { bg: "highlight", color: "text" },
                  "&:disabled": {
                    opacity: 0.55,
                    cursor: "not-allowed",
                  },
                }}
              >
                <Flex sx={{ alignItems: "center", gap: "0.45rem" }}>
                  <FiDownload size={14} aria-hidden="true" />
                  <span>Export</span>
                </Flex>
              </Button>
              <Button
                type="button"
                onClick={() => setVisibleMonth(startOfMonth(new Date()))}
                sx={{
                  variant: "buttons.primary",
                  bg: "background",
                  color: "text",
                  border: "1px solid",
                  borderColor: "gray",
                  px: "0.75rem",
                  py: "0.35rem",
                  fontSize: "xs",
                  "&:hover": { bg: "highlight", color: "text" },
                }}
              >
                <Flex sx={{ alignItems: "center", gap: "0.45rem" }}>
                  <FaRegCalendarCheck size={14} aria-hidden="true" />
                  <span>Today</span>
                </Flex>
              </Button>
            </Flex>
          </Flex>

          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: "760px" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  borderBottom: "1px solid",
                  borderBottomColor: "black",
                  bg: "lightgray",
                }}
              >
                {weekdayLabels.map((label) => (
                  <Box
                    key={label}
                    sx={{
                      px: "0.7rem",
                      py: "0.6rem",
                      borderRight: "1px solid",
                      borderRightColor: "rgba(0,0,0,0.12)",
                      ":last-of-type": { borderRight: "none" },
                    }}
                  >
                    <Text sx={{ variant: "text.label", color: "text" }}>
                      {label}
                    </Text>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  gridAutoRows: "minmax(156px, auto)",
                }}
              >
                {monthRange.map((day) => {
                  const dayKey = toDayKey(day);
                  const dayEvents = eventsByDay.get(dayKey) || [];
                  const isToday = isSameDay(day, new Date());
                  const inVisibleMonth = isSameMonth(day, visibleMonth);

                  return (
                    <Box
                      key={dayKey}
                      sx={{
                        minHeight: "156px",
                        px: "0.55rem",
                        py: "0.55rem",
                        borderRight: "1px solid",
                        borderBottom: "1px solid",
                        borderColor: "rgba(0,0,0,0.12)",
                        bg: inVisibleMonth ? "background" : "rgba(0,0,0,0.03)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "30px",
                          height: "30px",
                          borderRadius: "999px",
                          bg: isToday ? "primary" : "transparent",
                          color: isToday
                            ? "white"
                            : inVisibleMonth
                            ? "text"
                            : "gray",
                          fontWeight: "heading",
                          mb: "0.45rem",
                        }}
                      >
                        {format(day, "d")}
                      </Box>
                      <Box sx={{ display: "grid", gap: "0.35rem" }}>
                        {dayEvents.slice(0, 3).map((event) => {
                          const previewImageUrl = event?.mainImage?.asset
                            ? imageUrlFor(event.mainImage)
                                .width(440)
                                .height(260)
                                .fit("crop")
                                .auto("format")
                                .url()
                            : null;
                          const previewLocationLabel =
                            event?.onlineEvent || !event?.address?.city
                              ? "Online / TBA"
                              : [event?.address?.city, event?.address?.state]
                                  .filter(Boolean)
                                  .join(", ");
                          return (
                            <Link
                              key={event.id}
                              to={getEventsUrl(event.slug.current)}
                              sx={{
                                textDecoration: "none",
                                display: "block",
                              }}
                              onMouseEnter={(hoverEvent) => {
                                const rect =
                                  hoverEvent.currentTarget.getBoundingClientRect();
                                const previewLeft = Math.min(
                                  Math.max(
                                    rect.left +
                                      rect.width / 2 -
                                      CALENDAR_PREVIEW_WIDTH / 2,
                                    12
                                  ),
                                  window.innerWidth -
                                    CALENDAR_PREVIEW_WIDTH -
                                    12
                                );
                                setHoverPreview({
                                  event,
                                  imageUrl: previewImageUrl,
                                  locationLabel: previewLocationLabel,
                                  top: Math.max(rect.top - 8, 12),
                                  left: previewLeft,
                                });
                              }}
                              onFocus={(focusEvent) => {
                                const rect =
                                  focusEvent.currentTarget.getBoundingClientRect();
                                const previewLeft = Math.min(
                                  Math.max(
                                    rect.left +
                                      rect.width / 2 -
                                      CALENDAR_PREVIEW_WIDTH / 2,
                                    12
                                  ),
                                  window.innerWidth -
                                    CALENDAR_PREVIEW_WIDTH -
                                    12
                                );
                                setHoverPreview({
                                  event,
                                  imageUrl: previewImageUrl,
                                  locationLabel: previewLocationLabel,
                                  top: Math.max(rect.top - 8, 12),
                                  left: previewLeft,
                                });
                              }}
                              onMouseLeave={() => setHoverPreview(null)}
                              onBlur={() => setHoverPreview(null)}
                            >
                              <Box
                                sx={{
                                  px: "0.45rem",
                                  py: "0.35rem",
                                  borderRadius: "8px",
                                  bg: "#e6f0ff",
                                  color: "#1e4f9a",
                                  border: "1px solid",
                                  borderColor: "rgba(30,79,154,0.2)",
                                }}
                              >
                                <Text
                                  sx={{
                                    fontSize: "11px",
                                    fontWeight: "heading",
                                    lineHeight: 1.25,
                                    display: "block",
                                  }}
                                >
                                  {format(parseISO(event.startTime), "h:mm a")}
                                </Text>
                                <Text
                                  sx={{
                                    fontSize: "12px",
                                    lineHeight: 1.3,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    overflowWrap: "anywhere",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {event.title}
                                </Text>
                              </Box>
                            </Link>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <Text sx={{ fontSize: "11px", color: "gray" }}>
                            +{dayEvents.length - 3} more
                          </Text>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Card>
        {hoverPreview && (
          <Card
            sx={{
              position: "fixed",
              left: `${hoverPreview.left}px`,
              top: `${hoverPreview.top}px`,
              width: `${CALENDAR_PREVIEW_WIDTH}px`,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "black",
              overflow: "hidden",
              bg: "background",
              boxShadow: "0 12px 30px rgba(0,0,0,0.16)",
              transform: "translateY(-100%)",
              pointerEvents: "none",
              zIndex: 999,
            }}
          >
            {hoverPreview.imageUrl && (
              <Box
                as="img"
                src={hoverPreview.imageUrl}
                alt={
                  hoverPreview.event?.mainImage?.alt || hoverPreview.event.title
                }
                sx={{
                  width: "100%",
                  height: "120px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
            <Box sx={{ px: "0.7rem", py: "0.65rem" }}>
              <Text
                sx={{
                  display: "block",
                  fontWeight: "heading",
                  lineHeight: 1.2,
                  mb: "0.55rem",
                }}
              >
                {hoverPreview.event.title}
              </Text>
              <Text
                sx={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "darkgray",
                  m: 0,
                  lineHeight: 1.35,
                }}
              >
                {format(
                  parseISO(hoverPreview.event.startTime),
                  "EEEE, MMM d · h:mm a"
                )}
              </Text>
              <Text
                sx={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "darkgray",
                  mt: "0.15rem",
                  mb: 0,
                  lineHeight: 1.35,
                }}
              >
                {hoverPreview.locationLabel}
              </Text>
            </Box>
          </Card>
        )}

        <Box sx={{ mt: "1rem" }}>
          <Heading as="h2" sx={{ variant: "styles.h3", mb: "0.5rem" }}>
            {format(visibleMonth, "MMMM yyyy")} Events
          </Heading>
          <Box
            sx={{
              height: "1px",
              bg: "lightgray",
              mb: "0.65rem",
            }}
          />
          {visibleMonthEvents.length === 0 ? (
            <Text sx={{ color: "darkgray", m: 0 }}>
              No scheduled events found for this month.
            </Text>
          ) : (
            <Box as="ul" sx={{ m: 0, p: 0, display: "grid", gap: "0.45rem" }}>
              {visibleMonthEvents.map((event) => {
                const locationLabel =
                  event?.onlineEvent || !event?.address?.city
                    ? "Online / TBA"
                    : [event?.address?.city, event?.address?.state]
                        .filter(Boolean)
                        .join(", ");
                const imageUrl = event?.mainImage?.asset
                  ? imageUrlFor(event.mainImage)
                      .width(180)
                      .height(120)
                      .fit("crop")
                      .auto("format")
                      .url()
                  : null;
                return (
                  <Box
                    as="li"
                    key={`month-event-${event.id}`}
                    sx={{ listStyle: "none" }}
                  >
                    <Link
                      to={getEventsUrl(event.slug.current)}
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                      }}
                    >
                      <Card
                        sx={{
                          border: "1px solid",
                          borderColor: "lightgray",
                          borderRadius: "12px",
                          pr: "0.8rem",
                          py: 0,
                          bg: "background",
                          transition:
                            "border-color 160ms ease, background-color 160ms ease",
                          "&:hover": {
                            borderColor: "primary",
                            backgroundColor: "#f8fbff",
                          },
                        }}
                      >
                        <Flex sx={{ alignItems: "stretch", gap: "0.65rem" }}>
                          <Box
                            sx={{
                              width: "64px",
                              height: "48px",
                              borderRadius: "8px 0 0 8px",
                              overflow: "hidden",
                              flex: "0 0 64px",
                              bg: "lightgray",
                            }}
                          >
                            {imageUrl && (
                              <Box
                                as="img"
                                src={imageUrl}
                                alt={event?.mainImage?.alt || event.title}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                            )}
                          </Box>
                          <Box
                            sx={{
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              sx={{
                                fontWeight: "heading",
                                mb: "0.15rem",
                                lineHeight: 1.2,
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {event.title}
                            </Text>
                            <Text
                              sx={{
                                fontSize: "0.95rem",
                                color: "darkgray",
                                m: 0,
                                lineHeight: 1.2,
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {format(
                                parseISO(event.startTime),
                                "EEEE, MMM d, yyyy"
                              )}
                              {" · "}
                              {locationLabel}
                            </Text>
                          </Box>
                        </Flex>
                      </Card>
                    </Link>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </ContentContainer>
    </Layout>
  );
};

export default EventCalendarPage;
