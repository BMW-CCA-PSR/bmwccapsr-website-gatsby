/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Box, Card, Heading, Text } from "@theme-ui/components";
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
  { pattern: /(drive|driving|hpde|clinic|car control|autocross|track)/i, icon: FaFlagCheckered },
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

const EventCard = ({ event, href }) => {
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
        .width(800)
        .height(440)
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

  const card = (
    <Card
      sx={{
        textDecoration: "none",
        color: "text",
        backgroundColor: "white",
        width: "100%",
        height: "100%",
        borderRadius: "18px",
        display: "flex",
        flexDirection: "column",
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "text",
      }}
    >
      {imageUrl && (
        <Box sx={{ position: "relative" }}>
          <Box
            as="img"
            src={imageUrl}
            alt={event?.mainImage?.alt || event?.title || "Event"}
            {...nonDraggableImageProps}
            sx={{
              width: "100%",
              height: "100%",
              maxHeight: "220px",
              minHeight: "220px",
              objectFit: "cover",
              borderTopRightRadius: "15px",
              borderTopLeftRadius: "15px",
              ...nonDraggableImageSx,
            }}
          />
          {event?.startTime && (
            <Box
              sx={{
                position: "absolute",
                backgroundColor: "white",
                height: "65px",
                width: "60px",
                alignContent: "center",
                bottom: "20px",
                right: "20px",
                m: "auto",
                borderBottom: "5px",
                borderBottomStyle: "solid",
                borderBottomColor: "highlight",
              }}
            >
              <div
                sx={{
                  justifyContent: "center",
                  textAlign: "center",
                  pt: "5px",
                }}
              >
                <Text sx={{ variant: "styles.h4", display: "block" }}>
                  {format(parseISO(event.startTime), "MMM")}
                </Text>
                <Text sx={{ variant: "styles.h3" }}>
                  {format(parseISO(event.startTime), "d")}
                </Text>
              </div>
            </Box>
          )}
        </Box>
      )}
      <Box
        sx={{
          py: "5px",
          pb: "12px",
          px: "10px",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
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
                {React.createElement(getCategoryIcon(event.category.title), {
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
                variant: "text.label",
                bg: "#e6f0ff",
                color: "#0e4da9",
                px: 2,
                py: 1,
                borderRadius: 9999,
                fontWeight: 700,
                fontSize: "xxs",
                letterSpacing: "wide",
                textTransform: "uppercase",
                border: "1px solid",
                borderColor: "rgba(14,77,169,0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.28rem",
              }}
            >
              <FaLaptop size={12} aria-hidden="true" />
              Online
            </Text>
          )}
          {showUpcomingPill && (
            <Text
              sx={{
                variant: "text.label",
                bg: "#e8f7ec",
                color: "#1f7a3f",
                px: 2,
                py: 1,
                borderRadius: 9999,
                fontWeight: 700,
                fontSize: "xxs",
                letterSpacing: "wide",
                textTransform: "uppercase",
                border: "1px solid",
                borderColor: "rgba(31,122,63,0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.28rem",
              }}
            >
              <FaCalendarAlt size={12} aria-hidden="true" />
              Upcoming
            </Text>
          )}
        </Box>
        <Heading sx={{ textDecoration: "none", variant: "styles.h3" }}>
          {event.title}
        </Heading>
        {cityState && !isOnline && (
          <Text
            sx={{
              variant: "styles.h5",
              fontWeight: "body",
              textTransform: "capitalize",
            }}
          >
            {cityState}
          </Text>
        )}
      </Box>
    </Card>
  );

  if (!url) return card;

  return (
    <Link to={url} sx={{ textDecoration: "none" }}>
      {card}
    </Link>
  );
};

export default EventCard;
