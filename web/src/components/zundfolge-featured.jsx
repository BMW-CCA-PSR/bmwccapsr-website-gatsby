/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Box, Card, Heading, Text } from "@theme-ui/components";
import { Badge } from "theme-ui";
import SanityImage from "gatsby-plugin-sanity-image";
import PortableText from "./portableText";
import { getZundfolgeUrl } from "../lib/helpers";
import { differenceInDays, parseISO } from "date-fns";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";

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

  return (
    <Link to={href} sx={{ textDecoration: "none", color: "inherit" }}>
      <Card
        sx={{
          overflow: "hidden",
          borderRadius: "18px",
          border: "1px solid",
          borderColor: "black",
          boxShadow: "0 18px 40px rgba(0, 0, 0, 0.14)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: ["1fr", "1fr", "1.25fr 1fr"],
            minHeight: ["240px", "300px", "360px"],
          }}
        >
          <Box
            sx={{
              position: "relative",
              minHeight: "100%",
              overflow: "hidden",
              clipPath: ["none", "none", slantClip],
              borderTopLeftRadius: "18px",
              borderBottomLeftRadius: [0, 0, "18px"],
            }}
          >
            {post.mainImage && post.mainImage.asset && (
              <SanityImage
                {...post.mainImage}
                {...nonDraggableImageProps}
                width={1400}
                sx={{
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
              p: ["1.25rem", "1.75rem", "2.5rem"],
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "0.85rem",
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
                  <Badge
                    sx={{
                      bg: "transparent",
                      color: "white",
                      px: 2,
                      py: 1,
                      borderRadius: 9999,
                      fontWeight: 700,
                      fontSize: "xxs",
                      letterSpacing: "wide",
                      textTransform: "uppercase",
                      backgroundImage:
                        "linear-gradient(135deg, #b5322e 0%, #e55b57 100%)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    }}
                  >
                    Featured
                  </Badge>
                  {isNew && (
                    <Badge
                      sx={{
                        bg: "transparent",
                        color: "white",
                        px: 2,
                        py: 1,
                        borderRadius: 9999,
                        fontWeight: 700,
                        fontSize: "xxs",
                        letterSpacing: "wide",
                        textTransform: "uppercase",
                        backgroundImage:
                          "linear-gradient(135deg, #27d07e 0%, #06b7a6 100%)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                      }}
                    >
                      New
                    </Badge>
                  )}
                </Box>
              </Box>
            </Box>
            <Heading sx={{ variant: "styles.h2", color: "text", m: 0 }}>
              {post.title}
            </Heading>
            {excerpt && (
              <Text sx={{ variant: "styles.p", color: "gray" }}>
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
