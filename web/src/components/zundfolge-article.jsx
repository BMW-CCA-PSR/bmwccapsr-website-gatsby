/** @jsxImportSource theme-ui */
import { format, formatDistance, differenceInDays } from "date-fns";
import React from "react";
import SanityImage from "gatsby-plugin-sanity-image";
import PortableText from "./portableText";
import { Link } from "gatsby";
import VerticalLine from "./vertical-line";
import { Box, Card, Heading, Text, Flex } from "@theme-ui/components";
import RelatedContent from "./related-content";
import { randomGenerator } from "../lib/helpers";
import { BoxAd, BannerAd } from "./ads";
import { Avatar } from "theme-ui";
import { imageUrlFor } from "../lib/image-url";
import ContentContainer from "./content-container";
import { getZundfolgeUrl } from "../lib/helpers";
import { BoxIcon } from "./box-icons";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";

const ArticleNavCard = ({ post, label }) => {
  if (!post) return null;
  const categoryLabel = post.category?.title || "";
  return (
    <Link
      to={getZundfolgeUrl(post.slug.current)}
      sx={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "18px",
          border: "1px solid",
          borderColor: "black",
          minHeight: ["220px", "240px", "260px"],
          boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
        }}
      >
        {post.mainImage && post.mainImage.asset && (
          <SanityImage
            {...post.mainImage}
            {...nonDraggableImageProps}
            width={1200}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "18px",
              ...nonDraggableImageSx,
            }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 80%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "primary",
            color: "white",
            px: "1rem",
            py: "0.45rem",
            textTransform: "uppercase",
            letterSpacing: "wide",
            fontSize: "xxs",
            fontWeight: 700,
            textAlign: "left",
          }}
        >
          {label}
        </Box>
        <Box sx={{ position: "absolute", bottom: 0, p: ["1rem", "1.5rem"] }}>
          {categoryLabel && (
            <Text variant="text.label" sx={{ color: "white" }}>
              {categoryLabel}
            </Text>
          )}
          <Heading sx={{ variant: "styles.h3", color: "white", mt: 2 }}>
            {post.title}
          </Heading>
        </Box>
      </Card>
    </Link>
  );
};

function ZundfolgeArticle(props) {
  const {
    _rawBody,
    authors,
    category,
    title,
    mainImage,
    publishedAt,
    next,
    prev,
    boxes,
    banners,
    relatedPosts,
  } = props;
  const pubDate =
    publishedAt &&
    (differenceInDays(new Date(publishedAt), new Date()) > 3
      ? formatDistance(new Date(publishedAt), new Date())
      : format(new Date(publishedAt), "MMMM do, yyyy"));
  const authorString = String(
    authors.map((author) => ` ${author.author.name}`)
  );
  const cat = category.title;
  const randomBoxPosition = randomGenerator(0, boxes.edges.length - 1);
  const randomBannerPosition = randomGenerator(0, banners.edges.length - 1);
  const randomizedBox = boxes.edges[randomBoxPosition].node;
  const randomizedBanner = banners.edges[randomBannerPosition].node;

  const avatarSize = 50;
  const avatarOffset = 18;
  const avatarUrls = authors
    .map((author) => author?.author?.image)
    .filter(Boolean)
    .map((image) =>
      imageUrlFor(image)
        .width(avatarSize)
        .height(avatarSize)
        .fit("fill")
        .auto("format")
        .url()
    );
  return (
    <article>
      <ContentContainer
        sx={{
          display: "flex",
          pl: ["16px", "16px", "50px", "100px"],
          pr: ["16px", "16px", "50px", "100px"],
          pt: ["6.5rem", "6.5rem", "10rem", "10rem"],
          pb: "1rem",
          width: "100%",
          flexDirection: "row",
          //mx: "auto",
        }}
      >
        <Flex
          sx={{
            //pr: "16px",
            flexDirection: "column",
          }}
        >
          <Text
            variant="text.label"
            sx={{
              position: "relative",
              zIndex: 2,
              display: "inline-flex",
              alignItems: "center",
              mb: "0.25rem",
            }}
          >
            <Link
              to="/zundfolge/"
              sx={{
                textDecoration: "none",
                color: "text",
                display: "inline-flex",
                alignItems: "center",
                cursor: "pointer",
                px: "0.15em",
                mx: "-0.15em",
                position: "relative",
                zIndex: 3,
              }}
            >
              Zundfolge
            </Link>
            <Text as="span" sx={{ px: "0.35em" }}>
              /
            </Text>
            {cat}
          </Text>
          <Heading variant="styles.h1" sx={{ position: "relative", zIndex: 1 }}>
            {title}
            <BoxIcon
              as="span"
              sx={{
                display: "inline-grid",
                ml: "0.5rem",
                verticalAlign: "middle",
              }}
            />
          </Heading>
          <Flex
            sx={{
              py: "0.5rem",
              width: "100%",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            {avatarUrls.length > 0 && (
              <Box
                sx={{
                  position: "relative",
                  width: `${
                    avatarSize + (avatarUrls.length - 1) * avatarOffset
                  }px`,
                  height: `${avatarSize}px`,
                  flex: "0 0 auto",
                }}
              >
                {avatarUrls.map((url, index) => (
                  <Avatar
                    key={url}
                    src={url}
                    sx={{
                      width: `${avatarSize}px`,
                      height: `${avatarSize}px`,
                      minWidth: `${avatarSize}px`,
                      maxHeight: `${avatarSize}px`,
                      position: "absolute",
                      left: `${index * avatarOffset}px`,
                      zIndex: avatarUrls.length - index,
                      border: "2px solid",
                      borderColor: "background",
                      backgroundColor: "background",
                    }}
                  />
                ))}
              </Box>
            )}
            <Text sx={{ variant: "stypes.p", py: "1rem", px: "0.5rem" }}>
              By <b>{authorString}</b> | {pubDate}
            </Text>
          </Flex>
          {mainImage && mainImage.asset && (
            <div
              sx={{
                maxHeight: "500px",
                overflow: "hidden",
                borderRadius: "18px",
              }}
            >
              <SanityImage
                {...mainImage}
                width={1440}
                {...nonDraggableImageProps}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  ...nonDraggableImageSx,
                }}
              />
            </div>
          )}
          <BannerAd {...randomizedBanner} />
          {_rawBody && <PortableText body={_rawBody} boxed enableDropCap />}
        </Flex>
        <div
          sx={
            next || prev
              ? {
                  display: ["none", "none", "flex", "flex"],
                  mx: "auto",
                }
              : { display: "none" }
          }
        >
          <VerticalLine height="600" />
          <div
            sx={{
              mx: "auto",
            }}
          >
            <BoxAd {...randomizedBox} />
            <Heading variant="styles.h3" sx={{ my: "1rem" }}>
              Related Content
            </Heading>
            {relatedPosts &&
              relatedPosts
                .slice(0, 3)
                .map((post) => <RelatedContent {...post} />)}
          </div>
        </div>
      </ContentContainer>
      {(next || prev) && (
        <Box
          sx={{
            backgroundColor: "lightgray",
            py: ["2rem", "2.5rem", "3rem"],
            mt: ["2rem", "2.5rem", "3rem"],
          }}
        >
          <ContentContainer
            sx={{
              pl: ["16px", "16px", "50px", "100px"],
              pr: ["16px", "16px", "50px", "100px"],
              pb: ["2rem", "2.5rem", "3rem"],
            }}
          >
            <Heading sx={{ variant: "styles.h3", mb: "1.25rem" }}>
              Continue Reading
            </Heading>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: [
                  "1fr",
                  "1fr",
                  "repeat(2, minmax(0, 1fr))",
                ],
                gap: "1.5rem",
              }}
            >
              {next && <ArticleNavCard post={next} label="Next Article" />}
              {prev && <ArticleNavCard post={prev} label="Previous Article" />}
            </Box>
          </ContentContainer>
        </Box>
      )}
    </article>
  );
}

export default ZundfolgeArticle;
