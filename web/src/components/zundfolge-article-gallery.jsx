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
    const [main, left, right, bottom] = props.nodes;
    return (
<div
  sx={{
    flexDirection: 'column',
    height: '100%',
    display: 'flex',
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
      // gridTemplateRows: [
      //   '2fr 1fr 1fr',
      //   '2fr 1fr 1fr',
      //   '1fr 1fr 1fr',
      // ],
      gridAutoRows: "minmax(50px, 250px);",
      gridGap: 15,
      py: 3,
    }}>
    <div
      sx={{
        flex: 1,
        gridArea: 'long-box',
      }}>
      <ZundfolgeArticlePreview {...main} />
    </div>
    <div
      sx={{
        flex: 1,
        gridArea: 'left-box',
      }}>
      <ZundfolgeArticlePreview {...left} />
    </div>
    <div
      sx={{
        flex: 1,
        gridArea: 'right-box',
      }}>
      <ZundfolgeArticlePreview {...right} />
    </div>
    <div
      sx={{
        flex: 1,
        gridArea: 'wide-box',
      }}>
      <ZundfolgeArticlePreview {...bottom} />
    </div>
  </div>
</div>
    );
}

export default ZundfolgeArticleGallery;