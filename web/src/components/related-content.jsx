/** @jsxImportSource theme-ui */
import React from "react";
import { format } from "date-fns";
import { getEventsUrl, getZundfolgeUrl } from "../lib/helpers";
import { Link } from "gatsby";
import { Heading, Text, Box, Card, Flex } from "@theme-ui/components";
import SanityImage from "gatsby-plugin-sanity-image";
import { FaCalendarAlt } from "react-icons/fa";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";
import {
  getEventStartDate,
  getEventStartTimestamp,
} from "../lib/event-dates";

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

function RelatedContent(props) {
  const {
    title,
    mainImage,
    slug,
    publishedAt,
    category,
    address,
    venueName,
    onlineEvent,
  } = props;
  const isArticle = publishedAt ? true : false;
  const cat = category?.title || "Events";
  var cityState = null;
  const locationText = [
    venueName,
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const hasOnlineKeyword = /(zoom|online|remote)/i.test(locationText);
  const isOnline = Boolean(onlineEvent) || hasOnlineKeyword;
  const eventDate = getEventStartDate(props);
  const startTimestamp = getEventStartTimestamp(props);
  const nowTimestamp = Date.now();
  const upcomingCutoffTimestamp = nowTimestamp + 7 * 24 * 60 * 60 * 1000;
  const isUpcoming =
    Number.isFinite(startTimestamp) &&
    startTimestamp >= nowTimestamp &&
    startTimestamp <= upcomingCutoffTimestamp;
  if (isArticle) {
    // commenting out author data on related content for now - 1/24/22
  } else {
    cityState =
      address && address.city && address.state
        ? `${address.city}, ${address.state}`
        : "TBD";
  }
  if (isArticle) {
    return (
      <Link to={getZundfolgeUrl(slug.current)} sx={{ textDecoration: "none" }}>
        <Card
          sx={{
            textDecoration: "none",
            color: "white",
            background: `linear-gradient(to top, transparent 45%, black 100%)`,
            width: "100%",
            mx: "auto",
            mb: "1rem",
            borderRadius: "18px",
            borderStyle: "solid",
            borderColor: "black",
            borderWidth: "1px",
            position: "relative",
            overflow: "hidden",
            minHeight: "220px",
          }}
        >
          {mainImage && mainImage.asset && (
            <SanityImage
              {...mainImage}
              {...nonDraggableImageProps}
              width={800}
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "18px",
                zIndex: "-1",
                ...nonDraggableImageSx,
              }}
            />
          )}
          <Box p={3}>
            <Text sx={{ variant: "text.label", color: "white" }}>{cat}</Text>
            <Heading
              sx={{ textDecoration: "none", color: "white" }}
              variant="styles.h4"
            >
              {title}
            </Heading>
          </Box>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={getEventsUrl(slug.current)} sx={{ textDecoration: "none" }}>
      <Card
        sx={{
          textDecoration: "none",
          color: "text",
          backgroundColor: "white",
          maxWidth: "300px",
          minWidth: "200px",
          mx: "auto",
          mb: "1rem",
          borderRadius: "18px",
          borderStyle: "solid",
          borderColor: "black",
          borderWidth: "1px",
          overflow: "hidden",
        }}
      >
        <div>
          {mainImage && mainImage.asset && (
            <div sx={{ position: "relative", height: "180px" }}>
              <SanityImage
                {...mainImage}
                {...nonDraggableImageProps}
                width={600}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderTopLeftRadius: "18px",
                  borderTopRightRadius: "18px",
                  ...nonDraggableImageSx,
                }}
              />
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
                }}
              >
                <Box
                  sx={{
                    textAlign: "center",
                  }}
                >
                  <Text
                    sx={{
                      variant: "text.label",
                      color: "darkgray",
                      display: "block",
                    }}
                  >
                    {eventDate ? format(eventDate, "MMM") : ""}
                  </Text>
                  <Text sx={{ variant: "styles.h3", lineHeight: 1 }}>
                    {eventDate ? format(eventDate, "d") : ""}
                  </Text>
                </Box>
              </Box>
            </div>
          )}
        </div>
        <Box
          sx={{
            px: 3,
            pt: "0.8rem",
            pb: "0.9rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.16rem",
          }}
        >
          <Flex sx={{ alignItems: "center", gap: "0.32rem", flexWrap: "wrap" }}>
            <Text sx={{ variant: "text.label" }}>{cat}</Text>
            {isUpcoming && (
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
          </Flex>
          <Heading
            sx={{ textDecoration: "none", mt: 0, mb: 0, lineHeight: 0.98 }}
            variant="styles.h4"
          >
            {title}
          </Heading>
          {!isOnline && (
            <Text
              sx={{
                variant: "styles.h5",
                textTransform: "capitalize",
                fontWeight: "body",
                mt: 0,
                mb: 0,
                lineHeight: 1.1,
              }}
            >
              {cityState}
            </Text>
          )}
        </Box>
      </Card>
    </Link>
  );
}

export default RelatedContent;
