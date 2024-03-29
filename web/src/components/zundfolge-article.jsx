/** @jsxImportSource theme-ui */
import { format, formatDistance, differenceInDays } from "date-fns";
import React from "react";
import SanityImage from "gatsby-plugin-sanity-image"
import PortableText from "./portableText";
import { Link } from "gatsby";
import VerticalLine from "./vertical-line";
import { Heading, Text, Flex } from "@theme-ui/components";
import RelatedContent from "./related-content";
import { randomGenerator } from "../lib/helpers"
import { BoxAd, BannerAd }  from "./ads";
import { Avatar } from 'theme-ui'
import { imageUrlFor } from "../lib/image-url";

function ZundfolgeArticle(props) {
  const { _rawBody, authors, category, title, mainImage, publishedAt, next, prev, boxes, banners, relatedPosts} = props;
  const pubDate = publishedAt && (differenceInDays(new Date(publishedAt), new Date()) > 3
    ? formatDistance(new Date(publishedAt), new Date())
    : format(new Date(publishedAt), "MMMM do, yyyy"))
  const authorString = String(authors.map((author) => (` ${author.author.name}`)))
  const cat = category.title
  const randomBoxPosition = randomGenerator(0, boxes.edges.length - 1)
  const randomBannerPosition = randomGenerator(0, banners.edges.length - 1)
  const randomizedBox = boxes.edges[randomBoxPosition].node
  const randomizedBanner = banners.edges[randomBannerPosition].node


  const avatarImg = authors[0].author.image && imageUrlFor(authors[0].author.image)
    .width(50)
    .height(50)
    .fit("fill")
    .auto("format")
    .url()
  return (
    <article>
      <Flex sx={{
        pl: ["16px", "16px", "50px", "100px"],
        pr: ["16px", "16px", "50px", "100px"],
        pt: ["6.5rem","6.5rem","10rem","10rem"],
        pb: "1rem",
        width: "100%",
        flexDirection: "row",
        //mx: "auto",
      }}>
        <Flex sx={{
          //pr: "16px",
          flexDirection: "column",
        }}>
          <Text variant="text.label"><Link to="/zundfolge/" sx={{textDecoration:"none", color: "text"}}>Zundfolge</Link> / {cat}</Text>
          <Heading variant="styles.h1">{title}</Heading>
          <Flex sx={{py:"0.5rem", width: "100%"}}>
            <Avatar src={avatarImg} sx={{minWidth: "50px", maxHeight: "50px"}}/>
            <Text sx={{variant: "stypes.p", py: "1rem", px: "0.5rem"}}>By <b>{authorString}</b> | {pubDate}</Text>
          </Flex>
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
          <BannerAd {...randomizedBanner} />
          {_rawBody && <PortableText body={_rawBody} />}
        </Flex>
        <div sx={next || prev ? {
          display: ["none", "none", "flex", "flex"],
          mx: "auto",
          } : {display: "none"}}>
          <VerticalLine height="600"/>
          <div sx={{
            mx: "auto",
          }}>
            <BoxAd {...randomizedBox} />
            <Heading variant="styles.h3" sx={{my: "1rem"}}>Related Content</Heading>
            {relatedPosts && relatedPosts.slice(0, 3).map((post) => (<RelatedContent {...post} />))}
          </div>
        </div>  
      </Flex>
    </article>
  );
}

export default ZundfolgeArticle;