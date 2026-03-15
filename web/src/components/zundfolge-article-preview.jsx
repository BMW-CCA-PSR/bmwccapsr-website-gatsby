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
  const compactMobile = Boolean(props.compactMobile);
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
          borderRadius: compactMobile
            ? ["14px", "16px", "18px", "18px"]
            : "18px",
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
              borderRadius: compactMobile
                ? ["14px", "16px", "18px", "18px"]
                : "18px",
              zIndex: "-1",
              ...nonDraggableImageSx,
            }}
          />
        )}
        <Box p={compactMobile ? ["0.7rem", "0.8rem", 3, 3] : 3}>
          <div
            sx={{
              display: "flex",
              alignItems: "center",
              gap: compactMobile ? ["0.25rem", "0.35rem", 2, 2] : 2,
              flexWrap: "wrap",
            }}
          >
            <Text
              sx={{
                variant: "text.label",
                color: "white",
                fontSize: compactMobile
                  ? ["13px", "14px", null, null]
                  : undefined,
                letterSpacing: compactMobile
                  ? ["0.05em", "0.05em", null, null]
                  : undefined,
              }}
            >
              {cat}
            </Text>
            {isNew && <ZundfolgePill>New</ZundfolgePill>}
          </div>
          <Heading
            sx={{
              textDecoration: "none",
              variant: "styles.h3",
              color: "white",
              fontSize: compactMobile
                ? ["26px", "28px", null, null]
                : undefined,
              lineHeight: compactMobile ? [1.03, 1.05, null, null] : undefined,
              mt: compactMobile ? ["0.15rem", "0.2rem", null, null] : undefined,
              mb: 0,
              display: compactMobile
                ? ["-webkit-box", "-webkit-box", null, null]
                : undefined,
              WebkitBoxOrient: compactMobile
                ? ["vertical", "vertical", null, null]
                : undefined,
              WebkitLineClamp: compactMobile ? [3, 3, null, null] : undefined,
              overflow: compactMobile
                ? ["hidden", "hidden", null, null]
                : undefined,
            }}
          >
            {props.title}
          </Heading>
          {/* <Text sx={{color: `${fg}`}}>{format(parseISO(props.publishedAt), 'MMMM do, yyyy')}</Text> */}
          {publishedDate && (
            <Text
              sx={{
                variant: "stypes.p",
                py: compactMobile
                  ? ["0.1rem", "0.15rem", "0.35rem", "0.35rem"]
                  : "0.35rem",
                color: "white",
                fontSize: compactMobile
                  ? ["15px", "15px", null, null]
                  : undefined,
                lineHeight: compactMobile ? [1.2, 1.2, null, null] : undefined,
              }}
            >
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
