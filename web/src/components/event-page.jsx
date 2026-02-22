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
import { FiClock } from "react-icons/fi";
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
  const categoryFilterLink = cat
    ? `/events/?category=${encodeURIComponent(cat)}&active=1`
    : "/events/?active=1";
  const randomAdPosition = randomGenerator(0, boxes.edges.length - 1);
  const randomizedAd = boxes.edges[randomAdPosition].node;
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
                justifyContent: "center",
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
    </section>
  );
}

export default EventPage;
