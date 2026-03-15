/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Box, Card, Flex, Heading, Text } from "@theme-ui/components";
import { format, parseISO } from "date-fns";
import {
  FaCalendarAlt,
  FaFlagCheckered,
  FaLaptop,
  FaRoute,
  FaTools,
  FaUsers,
} from "react-icons/fa";
import { buildImageObj, getEventsUrl } from "../lib/helpers";
import { imageUrlFor } from "../lib/image-url";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";

const CATEGORY_ICON_RULES = [
  {
    pattern: /(drive|driving|hpde|clinic|car control|autocross|track)/i,
    icon: FaFlagCheckered,
  },
  { pattern: /(tour|route|road trip)/i, icon: FaRoute },
  { pattern: /(social|meet|gather|show|concours)/i, icon: FaUsers },
  { pattern: /(tech|maintenance|workshop)/i, icon: FaTools },
];

const getCategoryIcon = (categoryTitle) => {
  const label = String(categoryTitle || "").trim();
  if (!label) return FaCalendarAlt;
  const match = CATEGORY_ICON_RULES.find((rule) => rule.pattern.test(label));
  return match?.icon || FaCalendarAlt;
};

const statusPillBaseSx = {
  variant: "text.label",
  px: 2,
  py: 1,
  borderRadius: 9999,
  fontWeight: 700,
  fontSize: "xxs",
  letterSpacing: "wide",
  textTransform: "uppercase",
  border: "1px solid",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.28rem",
};

const slashInset = "12%";

const getExcerptText = (excerpt) => {
  if (!excerpt) return "";
  if (typeof excerpt === "string") return excerpt.trim();
  if (!Array.isArray(excerpt)) return "";
  return excerpt
    .flatMap((block) =>
      Array.isArray(block?.children)
        ? block.children.map((child) => child?.text || "")
        : []
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const EventCard = ({
  event,
  href,
  variant = "grid",
  compactMobile = false,
  titleSx,
}) => {
  if (!event) return null;

  const cityState =
    event?.address?.city && event?.address?.state
      ? `${event.address.city}, ${event.address.state}`
      : "";
  const locationText = [
    event?.venueName,
    event?.address?.line1,
    event?.address?.line2,
    event?.address?.city,
    event?.address?.state,
    event?.website,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const hasOnlineKeyword = /(zoom|online|remote)/i.test(locationText);
  const isOnline = Boolean(event?.onlineEvent) || hasOnlineKeyword;
  const imageSource = event?.mainImage ? buildImageObj(event.mainImage) : null;
  const imageUrl = imageSource
    ? imageUrlFor(imageSource)
        .width(1200)
        .height(720)
        .fit("crop")
        .auto("format")
        .url()
    : null;
  const url =
    href || (event?.slug?.current ? getEventsUrl(event.slug.current) : null);
  const startTimestamp = event?.startTime ? Date.parse(event.startTime) : NaN;
  const nowTimestamp = Date.now();
  const upcomingCutoffTimestamp = nowTimestamp + 7 * 24 * 60 * 60 * 1000;
  const isUpcoming =
    Number.isFinite(startTimestamp) &&
    startTimestamp >= nowTimestamp &&
    startTimestamp <= upcomingCutoffTimestamp;
  const showUpcomingPill = Boolean(event?.showUpcomingPill && isUpcoming);
  const excerptText = getExcerptText(event?._rawExcerpt);
  const categoryIcon = getCategoryIcon(event?.category?.title);
  const isHorizontal = variant === "horizontal";
  const shouldCenterGridTitle = !isHorizontal && (!cityState || isOnline);
  const compactGridImageHeight = compactMobile
    ? ["180px", "190px", "220px", "220px"]
    : "220px";
  const compactGridDateCard = compactMobile
    ? {
        right: ["14px", "16px", "20px", "20px"],
        bottom: ["14px", "16px", "20px", "20px"],
        minWidth: ["64px", "68px", "74px", "74px"],
        px: ["0.65rem", "0.75rem", "0.9rem", "0.9rem"],
        py: ["0.4rem", "0.48rem", "0.55rem", "0.55rem"],
      }
    : {};

  const card = (
    <Card
      sx={{
        textDecoration: "none",
        color: "text",
        backgroundColor: "white",
        width: "100%",
        height: "100%",
        borderRadius: "18px",
        border: "1px solid",
        borderColor: "black",
        overflow: "hidden",
      }}
    >
      <Flex
        sx={{
          flexDirection: isHorizontal
            ? ["column", "column", "row", "row"]
            : "column",
          alignItems: "stretch",
          height: "100%",
        }}
      >
        {imageUrl && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              minHeight: isHorizontal
                ? ["240px", "280px", "auto"]
                : compactGridImageHeight,
              height: isHorizontal
                ? ["240px", "280px", "auto"]
                : compactGridImageHeight,
              alignSelf: "stretch",
              flex: isHorizontal
                ? ["0 0 auto", "0 0 auto", "1 1 42%"]
                : "0 0 auto",
              overflow: "hidden",
              backgroundColor: "lightgray",
              borderRadius: isHorizontal
                ? ["0", "0", "18px 0 0 18px"]
                : ["18px 18px 0 0"],
              clipPath: isHorizontal
                ? [
                    "none",
                    "none",
                    `polygon(0 0, 100% 0, calc(100% - ${slashInset}) 100%, 0 100%)`,
                  ]
                : "none",
            }}
          >
            <Box
              as="img"
              src={imageUrl}
              alt={event?.mainImage?.alt || event?.title || "Event"}
              {...nonDraggableImageProps}
              sx={{
                position: isHorizontal ? "absolute" : "relative",
                inset: isHorizontal ? 0 : "auto",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                ...nonDraggableImageSx,
              }}
            />
            {event?.startTime && !isHorizontal && (
              <Box
                sx={{
                  position: "absolute",
                  right: "20px",
                  bottom: "20px",
                  border: "1px solid",
                  borderColor: "rgba(15, 23, 42, 0.18)",
                  borderRadius: "12px",
                  backgroundColor: "white",
                  minWidth: "74px",
                  px: "0.9rem",
                  py: "0.55rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...compactGridDateCard,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Text
                    sx={{
                      variant: "text.label",
                      color: "darkgray",
                      display: "block",
                    }}
                  >
                    {format(parseISO(event.startTime), "MMM")}
                  </Text>
                  <Text sx={{ variant: "styles.h3", lineHeight: 1 }}>
                    {format(parseISO(event.startTime), "d")}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>
        )}
        <Box
          sx={{
            px: isHorizontal
              ? "1.5rem"
              : compactMobile
              ? ["0.85rem", "0.92rem", "1rem", "1rem"]
              : "1rem",
            pt: isHorizontal
              ? "1rem"
              : compactMobile
              ? ["0.5rem", "0.58rem", "0.65rem", "0.65rem"]
              : "0.65rem",
            pb: isHorizontal
              ? "0.75rem"
              : compactMobile
              ? ["0.45rem", "0.5rem", "0.55rem", "0.55rem"]
              : "0.55rem",
            flex: isHorizontal
              ? ["1 1 100%", "1 1 100%", "1 1 58%"]
              : "1 1 auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.22rem",
            justifyContent: isHorizontal ? "center" : "flex-start",
          }}
        >
          {isHorizontal ? (
            <Flex
              sx={{
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <Box
                sx={{
                  flex: "1 1 auto",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.22rem",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  {event?.category?.title && (
                    <Text
                      sx={{
                        variant: "text.label",
                        color: "black",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <Box
                        as="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "22px",
                          height: "22px",
                          borderRadius: "999px",
                          bg: "lightgray",
                          color: "text",
                          flex: "0 0 22px",
                          lineHeight: 0,
                        }}
                      >
                        {React.createElement(categoryIcon, {
                          size: 13,
                          "aria-hidden": "true",
                        })}
                      </Box>
                      {event.category.title}
                    </Text>
                  )}
                  {isOnline && (
                    <Text
                      sx={{
                        ...statusPillBaseSx,
                        bg: "#e6f0ff",
                        color: "#0e4da9",
                        borderColor: "rgba(14,77,169,0.35)",
                      }}
                    >
                      <FaLaptop size={12} aria-hidden="true" />
                      Online
                    </Text>
                  )}
                  {showUpcomingPill && (
                    <Text
                      sx={{
                        ...statusPillBaseSx,
                        bg: "#e8f7ec",
                        color: "#1f7a3f",
                        borderColor: "rgba(31,122,63,0.35)",
                      }}
                    >
                      <FaCalendarAlt size={12} aria-hidden="true" />
                      Upcoming
                    </Text>
                  )}
                </Box>
                <Heading
                  sx={{
                    variant: "styles.h3",
                    lineHeight: 1,
                    mt: 0,
                    mb: 0,
                    pb: "0.02em",
                  }}
                >
                  {event.title}
                </Heading>
                {cityState && !isOnline && (
                  <Text
                    sx={{
                      variant: "styles.h5",
                      fontWeight: "body",
                      textTransform: "capitalize",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {cityState}
                  </Text>
                )}
                {excerptText && (
                  <Text
                    sx={{
                      variant: "styles.p",
                      color: "darkgray",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 0,
                    }}
                  >
                    {excerptText}
                  </Text>
                )}
              </Box>
              {event?.startTime && (
                <Box
                  sx={{
                    flex: "0 0 auto",
                    border: "1px solid",
                    borderColor: "rgba(15, 23, 42, 0.18)",
                    borderRadius: "12px",
                    backgroundColor: "white",
                    px: "0.9rem",
                    py: "0.45rem",
                    minWidth: "74px",
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Text
                      sx={{
                        variant: "text.label",
                        color: "darkgray",
                        display: "block",
                      }}
                    >
                      {format(parseISO(event.startTime), "MMM")}
                    </Text>
                    <Text
                      sx={{
                        variant: "styles.h3",
                        lineHeight: 1,
                      }}
                    >
                      {format(parseISO(event.startTime), "d")}
                    </Text>
                  </Box>
                </Box>
              )}
            </Flex>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                {event?.category?.title && (
                  <Text
                    sx={{
                      variant: "text.label",
                      color: "black",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Box
                      as="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        borderRadius: "999px",
                        bg: "lightgray",
                        color: "text",
                        flex: "0 0 22px",
                        lineHeight: 0,
                      }}
                    >
                      {React.createElement(categoryIcon, {
                        size: 13,
                        "aria-hidden": "true",
                      })}
                    </Box>
                    {event.category.title}
                  </Text>
                )}
                {isOnline && (
                  <Text
                    sx={{
                      ...statusPillBaseSx,
                      bg: "#e6f0ff",
                      color: "#0e4da9",
                      borderColor: "rgba(14,77,169,0.35)",
                    }}
                  >
                    <FaLaptop size={12} aria-hidden="true" />
                    Online
                  </Text>
                )}
                {showUpcomingPill && (
                  <Text
                    sx={{
                      ...statusPillBaseSx,
                      bg: "#e8f7ec",
                      color: "#1f7a3f",
                      borderColor: "rgba(31,122,63,0.35)",
                    }}
                  >
                    <FaCalendarAlt size={12} aria-hidden="true" />
                    Upcoming
                  </Text>
                )}
              </Box>
              <Heading
                sx={{
                  variant: "styles.h3",
                  fontSize: compactMobile
                    ? ["24px", "26px", "md", "md"]
                    : undefined,
                  lineHeight: 1,
                  mt: shouldCenterGridTitle ? "auto" : 0,
                  mb: shouldCenterGridTitle ? "auto" : 0,
                  pb: "0.02em",
                  ...(titleSx || {}),
                }}
              >
                {event.title}
              </Heading>
              {cityState && !isOnline && (
                <Text
                  sx={{
                    variant: "styles.h5",
                    fontWeight: "body",
                    textTransform: "capitalize",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {cityState}
                </Text>
              )}
            </>
          )}
        </Box>
      </Flex>
    </Card>
  );

  if (!url) return card;

  return (
    <Link
      to={url}
      sx={{
        textDecoration: "none",
        display: "block",
        width: "100%",
        height: "100%",
      }}
    >
      {card}
    </Link>
  );
};

export default EventCard;
