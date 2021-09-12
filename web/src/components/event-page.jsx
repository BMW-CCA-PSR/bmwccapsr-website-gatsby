/** @jsxImportSource theme-ui */
import { format, formatDistance } from "date-fns";
import React from "react";
import { buildImageObj } from "../lib/helpers";
import { imageUrlFor } from "../lib/image-url";
import PortableText from "./portableText";
import VerticalLine from "./vertical-line";
import { Container, Heading, Text, Flex, Box } from "@theme-ui/components";
import RelatedContent from "./related-content";
import EventDetails from "./event-detail";

function EventPage(props) {
  const { _rawBody, _updatedAt, categories, title, mainImage, startTime, next, prev } = props;
  var startInDays = startTime && (formatDistance(new Date(startTime), new Date()))
  var start = startTime && (format(new Date(startTime), "MMMM do, yyyy"))
  var updated = _updatedAt && (format(new Date(_updatedAt), "MMMM do, yyyy"))

  return (
    <event>
      <Flex sx={{
        mt: "6rem",
        pt: "3rem",
        width: "100%",
        flexDirection: "row",
        mx: "auto",
      }}>
        <Flex sx={{
          px: "1rem",
          flexDirection: "column",
        }}>
          <Heading variant="styles.h1">{title}</Heading>
          <Text sx={{variant: "styles.h4", py: "1rem"}}>{start} | {startInDays}</Text>
          <Text sx={{variant: "styles.p"}}>Last updated: {updated}</Text>
          {mainImage && mainImage.asset && (
            <div sx={{
              position: "relative",
            }}>
              <img
                src={imageUrlFor(buildImageObj(mainImage))
                  .width(1200)
                  .height(Math.floor((9 / 16) * 1200))
                  .fit("crop")
                  .auto("format")
                  .url()}
                alt={mainImage.alt}
                sx={{
                  width: "100%",
                  height: "100%"
                }}
              />
            </div>
          )}
          {_rawBody && <PortableText blocks={_rawBody} />}
          <EventDetails {...props}/>
          <aside>
            {categories && (
              <div>
                <h3>Categories</h3>
                <ul>
                  {categories.map(category => (
                    <li key={category._id}>{category.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </Flex>
        <div sx={next || prev ? {
          display: ["none", "none", "flex"],
          mx: "auto",
          } : {display: "none"}}>
          <VerticalLine height="600"/>
          <div sx={{
            mx: "auto",
            px: "1rem"
          }}>
            <Heading variant="styles.h3" sx={{mb: "1rem"}}>More Events</Heading>
            {next && <RelatedContent {...next} />}
            {prev && <RelatedContent {...prev} />}
          </div>
        </div>  
      </Flex>
    </event>
  );
}

export default EventPage;