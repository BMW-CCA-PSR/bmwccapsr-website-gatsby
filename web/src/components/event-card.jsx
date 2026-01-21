/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Box, Card, Heading, Text } from "@theme-ui/components";
import { format, parseISO } from "date-fns";
import { buildImageObj, getEventsUrl } from "../lib/helpers";
import { imageUrlFor } from "../lib/image-url";

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
    event?.website
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const hasOnlineKeyword = /(zoom|online|remote)/i.test(locationText);
  const isOnline = Boolean(event?.onlineEvent) || hasOnlineKeyword;
  const imageSource = event?.mainImage ? buildImageObj(event.mainImage) : null;
  const imageUrl = imageSource
    ? imageUrlFor(imageSource).width(800).height(440).fit("crop").auto("format").url()
    : null;
  const url =
    href || (event?.slug?.current ? getEventsUrl(event.slug.current) : null);

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
        borderWidth: isOnline ? "3px" : "1px",
        borderColor: isOnline ? "primary" : "text",
      }}
    >
      {imageUrl && (
        <Box sx={{ position: "relative" }}>
          <Box
            as="img"
            src={imageUrl}
            alt={event?.mainImage?.alt || event?.title || "Event"}
            sx={{
              width: "100%",
              height: "100%",
              maxHeight: "220px",
              minHeight: "220px",
              objectFit: "cover",
              borderTopRightRadius: "15px",
              borderTopLeftRadius: "15px",
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
              <div sx={{ justifyContent: "center", textAlign: "center", pt: "5px" }}>
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
        <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {event?.category?.title && (
            <Text sx={{ variant: "text.label", color: "black" }}>
              {event.category.title}
            </Text>
          )}
          {isOnline && (
            <Text
              sx={{
                variant: "text.label",
                bg: "transparent",
                color: "white",
                px: 2,
                py: 1,
                borderRadius: 9999,
                fontWeight: 700,
                fontSize: "xxs",
                letterSpacing: "wide",
                textTransform: "uppercase",
                backgroundImage: "linear-gradient(135deg, #1e94ff 0%, #0653b6 100%)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
              }}
            >
              Online
            </Text>
          )}
        </Box>
        <Heading sx={{ textDecoration: "none", variant: "styles.h3" }}>
          {event.title}
        </Heading>
        {cityState && !isOnline && (
          <Text sx={{ variant: "styles.h5", textTransform: "capitalize" }}>
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
