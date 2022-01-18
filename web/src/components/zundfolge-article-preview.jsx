/** @jsxImportSource theme-ui */
import { format, parseISO } from "date-fns";
import { Link } from "gatsby";
import React from "react";
import { Card, Box, Text, Heading, Flex, Badge } from "theme-ui"
import { buildImageObj, cn, getZundfolgeUrl } from "../lib/helpers";
import { imageUrlFor } from "../lib/image-url";
import PortableText from "./portableText";
import SanityImage from "gatsby-plugin-sanity-image"

function ZundfolgeArticlePreview(props) {
  console.log(props)
  const bg = props.mainImage.asset.metadata.palette.dominant.background ? props.mainImage.asset.metadata.palette.dominant.background : "lightgrey"
  const fg = props.mainImage.asset.metadata.palette.dominant.foreground ? props.mainImage.asset.metadata.palette.dominant.foreground : "black"
  return (
    <Link
      to={getZundfolgeUrl(props.slug.current)}
      sx={{textDecoration: "none"}}
    >
      <Card
        sx={{
          textDecoration: "none",
          background: `linear-gradient(to top, transparent 0%, ${bg} 100%)`,
          width: "100%",
          height: "100%",
          mx: "auto",
          borderRadius: "8px",
          position: "relative"
        }}
      >
          {props.mainImage && props.mainImage.asset && (
            <SanityImage {...props.mainImage} width={1440}
              sx={{
                position: "absolute", 
                width: "100%", 
                height: "100%", 
                objectFit: "cover",
                borderRadius: "8px",
                zIndex: "-1",
              }} 
            />
          )}
        <Box p={3} sx={{}}>
          <Heading sx={{ textDecoration: "none", variant: "styles.h3", color: `${fg}`,}} >{props.title}</Heading>
          <Text sx={{
            color: `${fg}`
          }}>{format(parseISO(props.publishedAt), "MMMM do, yyyy")}
          </Text>
          <Flex>
            {props.categories && props.categories.map(cat => (
              <Badge mr={3}>{cat.title}</Badge>
            ))}
          </Flex>
        </Box>
      </Card>
    </Link>
  );
}

export default ZundfolgeArticlePreview;