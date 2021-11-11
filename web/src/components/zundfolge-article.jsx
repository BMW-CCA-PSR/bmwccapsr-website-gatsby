/** @jsxImportSource theme-ui */
import { format, formatDistance, differenceInDays } from "date-fns";
import React from "react";
import SanityImage from "gatsby-plugin-sanity-image"
import PortableText from "./portableText";
import VerticalLine from "./vertical-line";
import { Heading, Text, Flex } from "@theme-ui/components";
import RelatedContent from "./related-content";
import { randomGenerator } from "../lib/helpers"
import BoxAd from "./box-ads";

function ZundfolgeArticle(props) {
  const { _rawBody, authors, categories, title, mainImage, publishedAt, next, prev, ads} = props;
  const pubDate = publishedAt && (differenceInDays(new Date(publishedAt), new Date()) > 3
    ? formatDistance(new Date(publishedAt), new Date())
    : format(new Date(publishedAt), "MMMM do, yyyy"))
  const authorString = String(authors.map((author) => (` ${author.author.name}`)))
  const catString = String(categories.map((cat) => (` ${cat.title}`)))
  const randomAdPosition = randomGenerator(0, ads.edges.length - 1)
  const randomizedAd = ads.edges[randomAdPosition].node
  return (
    <article>
      <Flex sx={{
        pl: ["16px", "16px", "50px", "100px"],
        pr: ["16px", "16px", "50px", "100px"],
        pt: ["6.5rem","6.5rem","10rem","10rem"],
        pb: "1rem",
        width: "100%",
        flexDirection: "row",
        mx: "auto",
      }}>
        <Flex sx={{
          //pr: "16px",
          flexDirection: "column",
        }}>
          <Text variant="text.label">{catString}</Text>
          <Heading variant="styles.h1">{title}</Heading>
          <Text sx={{variant: "stypes.p", py: "1rem"}}>By <b>{authorString}</b> | {pubDate}</Text>
          {mainImage && mainImage.asset && (
            <div sx={{
              maxHeight: "500px",
            }}>
              <SanityImage {...mainImage} width={1440}
                sx={{
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                }} 
              />
            </div>
          )}
          {_rawBody && <PortableText blocks={_rawBody} />}
        </Flex>
        <div sx={next || prev ? {
          display: ["none", "none", "flex", "flex"],
          mx: "auto",
          } : {display: "none"}}>
          <VerticalLine height="600"/>
          <div sx={{
            mx: "auto",
          }}>
            <BoxAd {...randomizedAd} />
            <Heading variant="styles.h3" sx={{my: "1rem"}}>Related Content</Heading>
            {next && <RelatedContent {...next} />}
            {prev && <RelatedContent {...prev} />}
          </div>
        </div>  
      </Flex>
    </article>
  );
}

export default ZundfolgeArticle;