/** @jsxImportSource theme-ui */
import React from "react";
import {
  filterOutDocsPublishedInTheFuture,
  getZundfolgeUrl,
} from "../lib/helpers";
import PortableText from "./portableText";
import SanityImage from "gatsby-plugin-sanity-image";
import {
  Box,
  Card,
  Container,
  Heading,
  Text,
  Flex,
  Avatar,
} from "@theme-ui/components";
import { Link } from "gatsby";
import { imageUrlFor } from "../lib/image-url";
import { BoxIcon } from "./box-icons";
import { outline } from "./event-slider";
import { differenceInDays, parseISO } from "date-fns";
import { FiChevronRight } from "react-icons/fi";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";
import ZundfolgePill from "./zundfolge-pill";

const slantLeftClip = "polygon(12% 0, 100% 0, 100% 100%, 0 100%)";
const slantRightClip = "polygon(0 0, 100% 0, 88% 100%, 0 100%)";
const zundfolgeRed = "#B5322E";
const StoryImg = (props) => {
  return (
    <SanityImage
      {...props}
      {...nonDraggableImageProps}
      width={600}
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: 0,
        ...nonDraggableImageSx,
      }}
    />
  );
};

const SlantedStoryImg = ({ image, slant = "left", flex }) => (
  <Box
    sx={{
      position: "relative",
      width: "100%",
      minHeight: ["240px", "280px", "auto"],
      alignSelf: "stretch",
      flex: flex || ["0 0 auto", "0 0 auto", "1 1 42%"],
      borderRadius: [
        "0 0 18px 18px",
        "0 0 18px 18px",
        slant === "left" ? "0 18px 18px 0" : "18px 0 0 18px",
      ],
      overflow: "hidden",
      clipPath: [
        "none",
        "none",
        slant === "left" ? slantLeftClip : slantRightClip,
      ],
    }}
  >
    <StoryImg {...image} />
  </Box>
);

function StoryRow(props) {
  const authors = props.node.authors;
  const authorString = authors[0]
    ? String(authors.map((author) => ` ${author.author.name}`))
    : null;
  const avatarImg = authors[0]
    ? authors[0].author.image &&
      imageUrlFor(authors[0].author.image)
        .width(48)
        .height(48)
        .fit("fill")
        .auto("format")
        .url()
    : null;
  const img = props.node._rawMainImage;
  const text = props.node._rawExcerpt ? props.node._rawExcerpt : null;
  const isNew = (() => {
    try {
      if (!props.node.publishedAt) return false;
      const days = differenceInDays(
        new Date(),
        parseISO(props.node.publishedAt)
      );
      return days <= 14;
    } catch (_) {
      return false;
    }
  })();
  return (
    <Flex
      sx={{
        flexDirection: ["column", "column", "row", "row"],
        alignItems: ["stretch", "stretch", "stretch", "stretch"],
      }}
    >
      <Box
        sx={{
          px: "1.5rem",
          pt: "1.5rem",
          pb: ["0.85rem", "1rem", "1.5rem", "1.5rem"],
          flex: ["1 1 100%", "1 1 100%", "1 1 60%"],
        }}
      >
        {props.node.category && (
          <Box
            sx={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Text sx={{ variant: "text.label", color: "black" }}>
              {props.node.category.title}
            </Text>
            {isNew && (
              <Box
                as="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  transform: "translateY(-1px)",
                }}
              >
                <ZundfolgePill>New</ZundfolgePill>
              </Box>
            )}
          </Box>
        )}
        <Heading
          sx={{
            variant: "styles.h3",
            fontSize: ["32px", "34px", "36px", "36px"],
            lineHeight: [1.02, 1.03, 1.03, 1.03],
            mt: ["0.18rem", "0.2rem", "0.24rem", "0.24rem"],
            mb: ["0.85rem", "1rem", "1rem", "1rem"],
            color: "darkgray",
          }}
        >
          {props.node.title}
        </Heading>
        <Flex
          sx={{
            display: ["none", "none", "flex", "flex"],
            pt: 0,
            pb: "0.05rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {avatarImg && (
            <Avatar
              src={avatarImg}
              sx={{ minWidth: "48px", maxHeight: "48px" }}
            />
          )}
          <Text
            sx={{
              variant: "stypes.p",
              py: "0.05rem",
              px: "0.5rem",
              color: `black`,
            }}
          >
            {authorString}
          </Text>
        </Flex>
        <Box
          sx={{
            variant: "styles.p",
            color: "black",
            lineHeight: [1.35, 1.35, "body", "body"],
            "& p": {
              lineHeight: [1.35, 1.35, "body", "body"],
            },
            "& p:last-of-type": {
              mb: 0,
            },
          }}
        >
          {text ? <PortableText body={text} /> : null}
        </Box>
      </Box>
      {img && (
        <SlantedStoryImg
          image={img}
          slant="left"
          flex={["1 1 100%", "1 1 100%", "1 1 40%"]}
        />
      )}
    </Flex>
  );
}

function StoryRowFlipped(props) {
  const authors = props.node.authors;
  const authorString = authors[0]
    ? String(authors.map((author) => ` ${author.author.name}`))
    : null;
  const avatarImg = authors[0]
    ? authors[0].author.image &&
      imageUrlFor(authors[0].author.image)
        .width(48)
        .height(48)
        .fit("fill")
        .auto("format")
        .url()
    : null;
  const img = props.node._rawMainImage;
  const text = props.node._rawExcerpt ? props.node._rawExcerpt : null;
  const isNew = (() => {
    try {
      if (!props.node.publishedAt) return false;
      const days = differenceInDays(
        new Date(),
        parseISO(props.node.publishedAt)
      );
      return days <= 14;
    } catch (_) {
      return false;
    }
  })();
  return (
    <Flex
      sx={{
        flexDirection: ["column-reverse", "column-reverse", "row", "row"],
        alignItems: ["stretch", "stretch", "stretch", "stretch"],
      }}
    >
      {img && (
        <SlantedStoryImg
          image={img}
          slant="right"
          flex={["1 1 100%", "1 1 100%", "1 1 40%"]}
        />
      )}
      <Box
        sx={{
          px: "1.5rem",
          pt: "1.5rem",
          pb: ["0.85rem", "1rem", "1.5rem", "1.5rem"],
          flex: ["1 1 100%", "1 1 100%", "1 1 60%"],
        }}
      >
        {props.node.category && (
          <Box
            sx={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Text sx={{ variant: "text.label", color: "black" }}>
              {props.node.category.title}
            </Text>
            {isNew && (
              <Box
                as="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  transform: "translateY(-1px)",
                }}
              >
                <ZundfolgePill>New</ZundfolgePill>
              </Box>
            )}
          </Box>
        )}
        <Heading
          sx={{
            variant: "styles.h3",
            fontSize: ["32px", "34px", "36px", "36px"],
            lineHeight: [1.02, 1.03, 1.03, 1.03],
            mt: ["0.18rem", "0.2rem", "0.24rem", "0.24rem"],
            mb: ["0.85rem", "1rem", "1rem", "1rem"],
            color: "darkgray",
          }}
        >
          {props.node.title}
        </Heading>
        <Flex
          sx={{
            display: ["none", "none", "flex", "flex"],
            pt: 0,
            pb: "0.05rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {avatarImg && (
            <Avatar
              src={avatarImg}
              sx={{ minWidth: "48px", maxHeight: "48px" }}
            />
          )}
          <Text
            sx={{
              variant: "stypes.p",
              py: "0.05rem",
              px: "0.5rem",
              color: `black`,
            }}
          >
            {authorString}
          </Text>
        </Flex>
        <Box
          sx={{
            variant: "styles.p",
            color: "black",
            lineHeight: [1.35, 1.35, "body", "body"],
            "& p": {
              lineHeight: [1.35, 1.35, "body", "body"],
            },
            "& p:last-of-type": {
              mb: 0,
            },
          }}
        >
          {text ? <PortableText body={text} /> : null}
        </Box>
      </Box>
    </Flex>
  );
}

function ZundfolgeLatest(props) {
  const visibleEdges = Array.isArray(props.edges)
    ? props.edges.filter((edge) =>
        filterOutDocsPublishedInTheFuture(edge?.node || {})
      )
    : [];
  return (
    <Container
      sx={{
        py: "1.5rem",
        px: ["16px", "20px", "24px"],
      }}
    >
      <Box sx={{ maxWidth: "1000px", mx: "auto", mb: "1.5rem" }}>
        <Flex
          sx={{
            alignItems: "baseline",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <Heading
            as="h2"
            sx={{
              variant: "styles.h2",
              mb: 0,
              color: zundfolgeRed,
            }}
          >
            Zündfolge
            <BoxIcon
              as="span"
              sx={{
                display: "inline-grid",
                ml: "0.5rem",
                verticalAlign: "middle",
              }}
            />
          </Heading>
          <Text
            as="span"
            sx={{
              fontStyle: "italic",
              color: "black",
              fontSize: ["xxs", "xs"],
              lineHeight: 1.2,
              ml: "auto",
              textAlign: "right",
            }}
          >
            The official newsletter of the Puget Sound Chapter CCA Since 1975.
          </Text>
        </Flex>
        <Box
          as="hr"
          sx={{
            border: "none",
            borderTop: "3px solid",
            borderColor: "text",
            mt: "0.75rem",
            mb: 0,
          }}
        />
      </Box>

      {visibleEdges.slice(0, 3).map((c, i) => {
        const href = getZundfolgeUrl(c.node.slug.current);
        return (
          <Link
            key={c.node.id || href}
            to={href}
            sx={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
              maxWidth: "1000px",
              mx: "auto",
              mb: "1.5rem",
            }}
          >
            <Card
              sx={{
                width: "100%",
                borderRadius: "18px",
                border: "1px solid",
                borderColor: "black",
                overflow: "hidden",
              }}
            >
              {i % 2 === 0 ? <StoryRow {...c} /> : <StoryRowFlipped {...c} />}
            </Card>
          </Link>
        );
      })}
      <Box
        sx={{
          maxWidth: "1000px",
          mx: "auto",
          mt: "1.5rem",
          textAlign: "center",
        }}
      >
        <Link to="/zundfolge/" sx={outline}>
          <Box
            as="span"
            sx={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            More Articles
            <FiChevronRight size={16} aria-hidden="true" />
          </Box>
        </Link>
      </Box>
    </Container>
  );
}

ZundfolgeLatest.defaultProps = {
  edges: [
    {
      title: "",
      slug: {
        current: "",
      },
      category: {
        title: "",
      },
      authors: [
        {
          author: {
            name: "",
          },
        },
      ],
    },
    {
      title: "",
      slug: {
        current: "",
      },
      category: {
        title: "",
      },
      authors: [
        {
          author: {
            name: "",
          },
        },
      ],
    },
  ],
};
export default ZundfolgeLatest;
