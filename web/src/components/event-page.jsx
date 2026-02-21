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
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";

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
  } = props;
  const isPast = startTime ? new Date(startTime) < new Date() : false;
  const startInDays = startTime
    ? formatDistanceStrict(new Date(startTime), new Date(), { addSuffix: true })
    : null;
  var start = startTime && format(new Date(startTime), "MMMM do, yyyy");
  var updated = _updatedAt && format(new Date(_updatedAt), "MMMM do, yyyy");
  const cat = category.title;
  const randomAdPosition = randomGenerator(0, boxes.edges.length - 1);
  const randomizedAd = boxes.edges[randomAdPosition].node;
  return (
    <event>
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
          }}
        >
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
              {cat}
            </Text>
          </Box>
          <Heading
            variant="styles.h1"
            sx={{ mt: 0, position: "relative", zIndex: 1 }}
          >
            {title}
            {isPast ? " (past)" : ""}
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
          <Text sx={{ variant: "styles.p" }}>Last updated: {updated}</Text>
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
            next || prev
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
            {next && <RelatedContent {...next} />}
            {prev && <RelatedContent {...prev} />}
          </div>
        </div>
      </ContentContainer>
    </event>
  );
}

export default EventPage;
