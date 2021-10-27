/** @jsxImportSource theme-ui */
import { format, formatDistance } from "date-fns";
import React from "react";
import SanityImage from "gatsby-plugin-sanity-image"
import PortableText from "./portableText";
import VerticalLine from "./vertical-line";
import { Container, Heading, Text, Flex, Box } from "@theme-ui/components";
import RelatedContent from "./related-content";
import EventDetails from "./event-detail";
import { randomGenerator } from "../lib/helpers"
import BoxAd from "./box-ad";

function EventPage(props) {
  const { _rawBody, _updatedAt, categories, title, mainImage, startTime, next, prev, ads } = props;
  var startInDays = startTime && (formatDistance(new Date(startTime), new Date()))
  var start = startTime && (format(new Date(startTime), "MMMM do, yyyy"))
  var updated = _updatedAt && (format(new Date(_updatedAt), "MMMM do, yyyy"))
  const randomAdPosition = randomGenerator(0, ads.edges.length - 1)
  const randomizedAd = ads.edges[randomAdPosition].node
  return (
    <event>
      <Flex sx={{
        pl: ["16px", "16px", "50px", "100px"],
        pr: ["16px", "16px", "50px", "100px"],
        pt: ["6.5rem","6.5rem","10rem","10rem"],
        width: "100%",
        flexDirection: "row",
        mx: "auto",
      }}>
        <Flex sx={{
          //pr: "16px",
          flexDirection: "column",
        }}>
          <Heading variant="styles.h1">{title}</Heading>
          <Text sx={{variant: "styles.h4", py: "1rem"}}>{start} | {startInDays}</Text>
          <Text sx={{variant: "styles.p"}}>Last updated: {updated}</Text>
          {mainImage && mainImage.asset && (
            <div sx={{
              maxHeight: "500px",
            }}>
              <SanityImage {...mainImage} width={1440}
                sx={{
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                }} />
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
          }}>
            <BoxAd {...randomizedAd} />
            <Heading variant="styles.h3" sx={{my: "1rem"}}>More Events</Heading>
            {next && <RelatedContent {...next} />}
            {prev && <RelatedContent {...prev} />}
          </div>
        </div>  
      </Flex>
    </event>
  );
}

export default EventPage;