/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Box, Card, Heading, Text } from "@theme-ui/components";
import PortableText from "./portableText";
import { getZundfolgeUrl } from "../lib/helpers";
import { imageUrlFor } from "../lib/image-url";
import { differenceInDays, parseISO } from "date-fns";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";
import ZundfolgePill from "./zundfolge-pill";

const slantInset = "12%";
const slantClip = `polygon(0 0, 100% 0, calc(100% - ${slantInset}) 100%, 0 100%)`;
const ZundfolgeFeatured = ({ post }) => {
  if (!post) return null;
  let isNew = false;
  try {
    if (post.publishedAt) {
      const days = differenceInDays(new Date(), parseISO(post.publishedAt));
      isNew = days <= 14;
    }
  } catch (_) {
    isNew = false;
  }
  const href = getZundfolgeUrl(post.slug.current);
  const excerpt = post._rawExcerpt;
  const imageUrl = post?.mainImage?.asset
    ? imageUrlFor(post.mainImage)
        .width(1400)
        .height(900)
        .fit("crop")
        .auto("format")
        .url()
    : null;

  return (
    <Link to={href} sx={{ textDecoration: "none", color: "inherit" }}>
      <Card
        sx={{
          overflow: "hidden",
          borderRadius: "18px",
          border: "1px solid",
          borderColor: "black",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: ["1fr", "1fr", "1.25fr 1fr"],
            minHeight: ["320px", "380px", "300px"],
          }}
        >
          <Box
            sx={{
              position: "relative",
              minHeight: ["180px", "220px", "100%"],
              overflow: "hidden",
              clipPath: ["none", "none", slantClip],
              borderTopLeftRadius: "18px",
              borderTopRightRadius: ["18px", "18px", 0],
              borderBottomLeftRadius: [0, 0, "18px"],
            }}
          >
            {imageUrl && (
              <Box
                as="img"
                src={imageUrl}
                alt={post?.mainImage?.alt || post?.title || "Featured article"}
                {...nonDraggableImageProps}
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  ...nonDraggableImageSx,
                }}
              />
            )}
          </Box>
          <Box
            sx={{
              py: ["1.5rem", "1.8rem", "2.2rem"],
              px: ["1rem", "1.25rem", "1.6rem"],
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "0.55rem",
              backgroundColor: "background",
            }}
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.65rem",
                }}
              >
                {post.category?.title && (
                  <Text variant="text.label" sx={{ color: "darkgray" }}>
                    {post.category.title}
                  </Text>
                )}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ZundfolgePill variant="featured">Featured</ZundfolgePill>
                  {isNew && <ZundfolgePill>New</ZundfolgePill>}
                </Box>
              </Box>
            </Box>
            <Heading sx={{ variant: "styles.h2", color: "text", m: 0 }}>
              {post.title}
            </Heading>
            {excerpt && (
              <Text
                sx={{
                  variant: "styles.p",
                  color: "gray",
                  pr: ["0.15rem", "0.25rem", "0.9rem"],
                  lineHeight: [1.35, 1.4, null],
                  "& p": {
                    lineHeight: [1.35, 1.4, null],
                    my: 0,
                  },
                }}
              >
                <PortableText body={excerpt} />
              </Text>
            )}
          </Box>
        </Box>
      </Card>
    </Link>
  );
};

export default ZundfolgeFeatured;
