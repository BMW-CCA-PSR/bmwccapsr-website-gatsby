/** @jsxImportSource theme-ui */
import React from "react";
import { format, parseISO } from "date-fns";
import { getEventsUrl, getZundfolgeUrl } from "../lib/helpers";
import { Link } from "gatsby";
import { Heading, Text, Box, Card, Flex } from "@theme-ui/components";
import SanityImage from "gatsby-plugin-sanity-image";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";

function RelatedContent(props) {
  const {
    title,
    mainImage,
    slug,
    publishedAt,
    category,
    startTime,
    address,
    venueName,
    onlineEvent,
  } = props;
  const isArticle = publishedAt ? true : false;
  const cat = category.title;
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
          borderColor: isOnline ? "primary" : "black",
          borderWidth: isOnline ? "3px" : "1px",
          overflow: "hidden",
        }}
      >
        <div>
          {mainImage && mainImage.asset && (
            <div sx={{ position: "relative" }}>
              <SanityImage
                {...mainImage}
                {...nonDraggableImageProps}
                width={600}
                sx={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                  borderTopLeftRadius: isOnline ? "15px" : "18px",
                  borderTopRightRadius: isOnline ? "15px" : "18px",
                  ...nonDraggableImageSx,
                }}
              />
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
                    {format(parseISO(startTime), "MMM")}
                  </Text>
                  <Text sx={{ variant: "styles.h3" }}>
                    {format(parseISO(startTime), "d")}
                  </Text>
                </div>
              </Box>
            </div>
          )}
        </div>
        <Box p={3}>
          <Flex sx={{ alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <Text sx={{ variant: "text.label" }}>{cat}</Text>
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
                  backgroundImage:
                    "linear-gradient(135deg, #0b3a6f 0%, #1e94ff 100%)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                }}
              >
                Online
              </Text>
            )}
          </Flex>
          <Heading
            sx={{ textDecoration: "none", mt: isOnline ? "0.35rem" : 0 }}
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
