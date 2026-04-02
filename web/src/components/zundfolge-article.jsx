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
import { BoxIconTitleLockup } from "./box-icons";
import StylizedLandingHeader from "./stylized-landing-header";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";

const zundfolgeRed = "#B5322E";

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
            width={960}
            sizes="(min-width: 1200px) 540px, (min-width: 768px) 46vw, 100vw"
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
    authors.map((author) => ` ${author.author.name}`),
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
        .url(),
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
          flexDirection: "column",
        }}
      >
        <StylizedLandingHeader
          word="Zundfolge"
          color={zundfolgeRed}
          bleedTop="65px"
          topInset={["11rem", "12rem", "15rem", "17rem"]}
          minHeight="0px"
          patternViewportInset={[
            "0 0 1rem 0",
            "0 0 1.25rem 0",
            "0 0 1.6rem 0",
            "0 0 2rem 0",
          ]}
          rowCount={22}
          rowRepeatCount={30}
          textFontSize={["30px", "36px", "46px", "56px"]}
          rowHeight={["1.55rem", "1.8rem", "2.25rem", "2.7rem"]}
          rowGap={["0.08rem", "0.1rem", "0.12rem", "0.16rem"]}
          rowOverflow="visible"
          textLineHeight={0.94}
          textTranslateY="0%"
          patternInset={["-44% -70%", "-44% -70%", "-46% -58%", "-48% -52%"]}
          patternTransform={[
            "translateY(-4%) rotate(-45deg) scale(1.08)",
            "translateY(-4%) rotate(-45deg) scale(1.08)",
            "translateY(-2%) rotate(-45deg) scale(1.1)",
            "translateY(-2%) rotate(-45deg) scale(1.12)",
          ]}
          rowContents={[
            "ZUNDFOLGE",
            "1•3•4•2",
            "ZUNDFOLGE",
            "1•5•3•6•4•2",
            "ZUNDFOLGE",
          ]}
        />
        <Flex
          sx={{
            width: "100%",
            alignItems: "flex-start",
          }}
        >
          <Flex
            sx={{
              flex: "1 1 0",
              minWidth: 0,
              width: "100%",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                position: "relative",
                height: 0,
                mb: 0,
              }}
            >
              <Text
                variant="text.label"
                sx={{
                  position: "absolute",
                  top: "-1.2rem",
                  left: 0,
                  zIndex: 2,
                  display: "inline-flex",
                  alignItems: "center",
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
            </Box>
            <Heading
              variant="styles.h1"
              sx={{
                position: "relative",
                zIndex: 1,
                fontSize: "xl",
                "@media screen and (max-width: 767px)": {
                  fontSize: "46px",
                },
              }}
            >
              <BoxIconTitleLockup text={title} />
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
                  width={1200}
                  sizes="(min-width: 1200px) 920px, (min-width: 768px) calc(100vw - 140px), calc(100vw - 32px)"
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
                    flex: "0 0 auto",
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
                  .map((post) => <RelatedContent key={post.id} {...post} />)}
            </div>
          </div>
        </Flex>
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
