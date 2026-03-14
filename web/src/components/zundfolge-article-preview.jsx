/** @jsxImportSource theme-ui */
import { format, parseISO, differenceInDays } from "date-fns";
import { Link } from "gatsby";
import React, { useEffect, useState } from "react";
import { Card, Box, Text, Heading } from "theme-ui";
import { getZundfolgeUrl } from "../lib/helpers";
import SanityImage from "gatsby-plugin-sanity-image";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";
import ZundfolgePill from "./zundfolge-pill";

function ZundfolgeArticlePreview(props) {
  const cat = props.category ? props.category.title : "null";
  const publishedDate = props.publishedAt
    ? format(parseISO(props.publishedAt), "MMM d, yyyy")
    : "";
  const [isNew, setIsNew] = useState(false);
  useEffect(() => {
    try {
      if (!props.publishedAt) return;
      const days = differenceInDays(new Date(), parseISO(props.publishedAt));
      setIsNew(days <= 14);
    } catch (_) {
      setIsNew(false);
    }
  }, [props.publishedAt]);

  return (
    <Link
      to={getZundfolgeUrl(props.slug.current)}
      sx={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          textDecoration: "none",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0) 100%)",
          width: "100%",
          height: "100%",
          mx: "auto",
          borderRadius: "18px",
          borderStyle: "solid",
          borderColor: "black",
          borderWidth: "1px",
          position: "relative",
        }}
      >
        {/* NEW pill now placed inline next to the category label below */}
        {props.mainImage && props.mainImage.asset && (
          <SanityImage
            {...props.mainImage}
            {...nonDraggableImageProps}
            width={1440}
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
          <div sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Text sx={{ variant: "text.label", color: "white" }}>{cat}</Text>
            {isNew && <ZundfolgePill>New</ZundfolgePill>}
          </div>
          <Heading
            sx={{
              textDecoration: "none",
              variant: "styles.h3",
              color: "white",
            }}
          >
            {props.title}
          </Heading>
          {/* <Text sx={{color: `${fg}`}}>{format(parseISO(props.publishedAt), 'MMMM do, yyyy')}</Text> */}
          {publishedDate && (
            <Text sx={{ variant: "stypes.p", py: "0.35rem", color: "white" }}>
              {publishedDate}
            </Text>
          )}
        </Box>
      </Card>
    </Link>
  );
}

ZundfolgeArticlePreview.defaultProps = {
  authors: [
    {
      author: {
        name: "",
      },
    },
  ],
  title: "",
  nodes: [],
  publishedAt: "2022-01-01",
  category: {
    title: "",
  },
  browseMoreHref: "",
  slug: {
    current: "",
  },
};

export default ZundfolgeArticlePreview;
