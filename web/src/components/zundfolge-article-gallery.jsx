/** @jsxImportSource theme-ui */
import { Link } from "gatsby";
import { Card, Box, Text, Heading, Flex, Input } from "theme-ui"
import React from "react";
import { format, parseISO } from "date-fns";
import { imageUrlFor } from "../lib/image-url";
import { buildImageObj, cn, getZundfolgeUrl } from "../lib/helpers";
import ZundfolgeArticlePreview from "./zundfolge-article-preview";
import RelatedContent from "./related-content";
import CTALink from "./CTALink";

function ZundfolgeArticleGallery(props) {
    const [main, left, right] = props.nodes;
    return (
<div
  sx={{
    flexDirection: 'column',
    height: '100%',
    display: 'flex'
  }}>
  <div
    sx={{
      display: 'grid',
      flex: 1,
      height: 'auto',
      gridTemplateAreas: [
        '"long-box long-box" "left-box right-box" "wide-box wide-box"',
        '"long-box long-box" "left-box right-box" "wide-box wide-box"',
        '"long-box long-box left-box right-box" "long-box long-box wide-box wide-box"'
      ],
      gridTemplateColumns: [
        'repeat(2, 1fr)',
        'repeat(2, 1fr)',
        'repeat(4, 1fr)'
      ],
      gridTemplateRows: [
        '2fr 1fr 1fr',
        '2fr 1fr 1fr',
        'none'
      ],
      gridGap: 15,
      py: 3,
      //backgroundColor: "yellow"
    }}>
    <div
      sx={{
        flex: 1,
        gridArea: 'long-box',
        //backgroundColor: "pink"
      }}>
      <ZundfolgeArticlePreview {...main} max="1200" />
    </div>
    <div
      sx={{
        flex: 1,
        gridArea: 'left-box',
        //backgroundColor: "red"
      }}>
      <ZundfolgeArticlePreview {...left} />
    </div>
    <div
      sx={{
        flex: 1,
        gridArea: 'right-box',
        //backgroundColor: "blue"
      }}>
      <ZundfolgeArticlePreview {...right} />
    </div>
    <div
      sx={{
        flex: 1,
        gridArea: 'wide-box',
        //backgroundColor: "purple",
      }}>
      <Box sx={{
          backgroundColor: "highlight",
          height: "100%",
          width: "100%",
          p: 3,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          borderRadius: 8
          }}>
        <Text variant="styles.h3" sx={{pb: "6px"}}>Sign up for our newsletter</Text>
        <Flex sx={{flexDirection: "row"}}>
            <Input defaultValue="email" sx={{px: 2}}/>
            <CTALink title="submit"/>
            </Flex>
      </Box>
    </div>
  </div>
</div>
    );
}

export default ZundfolgeArticleGallery;