/** @jsxImportSource theme-ui */
import { Themed } from "theme-ui";
import React, { useEffect, useState } from "react";
import { Link } from "gatsby";
import ReactPlayer from "react-player";
import InstagramEmbed from "react-instagram-embed";
import SanityImage from "gatsby-plugin-sanity-image";
import { FiMaximize2, FiX } from "react-icons/fi";
import { Box, Text } from "@theme-ui/components";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";

var style = {
  textDecoration: "none",
  textTransform: "uppercase",
  fontSize: 15,
  backgroundColor: "primary",
  border: "none",
  color: "white",
  mx: [0, 0, "1rem", "1rem"],
  py: "8px",
  my: "5px",
  px: "20px",
  position: "relative",
  textAlign: "center",
  borderRadius: "4px",
  transition: "background-color 0.5s ease-out",
  boxShadow:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  "&:hover": {
    color: "white",
    bg: "highlight",
  },
};

const headingSx = {
  mt: 4,
  mb: 3,
  letterSpacing: "tight",
};

const paragraphSx = {
  mb: 3,
  lineHeight: "body",
};

const listSx = {
  pl: 4,
  my: 3,
  lineHeight: "body",
};

const AuthorReference = ({ node }) => {
  if (node && node.author && node.author.name) {
    return <span>{node.author.name}</span>;
  }
  return <></>;
};

const ImageBlock = ({ node }) => {
  const caption = node?.caption || node?.alt;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <Box
      sx={{
        backgroundColor: "#e0e0e0",
        padding: 0,
        borderRadius: "18px",
        overflow: "hidden",
        my: 4,
        boxShadow: "0 16px 30px -20px rgba(0, 0, 0, 0.35)",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <SanityImage
          {...node}
          {...nonDraggableImageProps}
          width={900}
          alt={node?.alt || ""}
          sx={{
            width: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: "18px 18px 0 0",
            ...nonDraggableImageSx,
          }}
        />
        <Box
          as="button"
          type="button"
          aria-label="Expand image"
          onClick={() => setIsOpen(true)}
          sx={{
            position: "absolute",
            right: "0.75rem",
            bottom: "0.75rem",
            width: "36px",
            height: "36px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            bg: "rgba(0,0,0,0.65)",
            color: "white",
            boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
            "&:hover": {
              bg: "rgba(0,0,0,0.85)",
            },
          }}
        >
          <FiMaximize2 size={16} />
        </Box>
      </Box>
      {caption ? (
        <Box sx={{ px: "0.75rem", py: "0.75rem" }}>
          <Text
            sx={{
              variant: "styles.p",
              color: "darkgray",
              fontStyle: "italic",
            }}
          >
            {caption}
          </Text>
        </Box>
      ) : null}
      {isOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            bg: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: ["1rem", "1.5rem"],
          }}
          onClick={() => setIsOpen(false)}
        >
          <Box
            sx={{
              position: "relative",
              maxWidth: "1200px",
              width: "100%",
              maxHeight: "90vh",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <SanityImage
              {...node}
              {...nonDraggableImageProps}
              width={1600}
              alt={node?.alt || ""}
              sx={{
                width: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                display: "block",
                ...nonDraggableImageSx,
              }}
            />
            <Box
              as="button"
              type="button"
              aria-label="Close image"
              onClick={() => setIsOpen(false)}
              sx={{
                position: "absolute",
                top: "-0.5rem",
                right: "-0.5rem",
                width: "36px",
                height: "36px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                bg: "white",
                color: "black",
                boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
                "&:hover": {
                  bg: "lightgray",
                },
              }}
            >
              <FiX size={18} />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const serializers = {
  types: {
    authorReference: AuthorReference,
    mainImage: ImageBlock,
    image: ImageBlock,
    videoEmbed: ({ node }) => (
      <div
        sx={{
          mx: "auto",
          my: 4,
          display: "flex",
          position: "relative",
          paddingTop: "56.25%",
          width: ["92vw", "92vw", "50vw", "50vw"],
        }}
      >
        <ReactPlayer
          sx={{ position: "absolute", top: 0 }}
          url={node.url}
          width="100%"
          height="100%"
          controls
        />
      </div>
    ),
    instagram: ({ node }) => {
      if (!node.url) return null;
      return <InstagramEmbed url={node.url} />;
    },
    file: ({ node }) => {
      console.log(node.asset.filename.split(".")[0]);
      if (node.asset) {
        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {" "}
            {/* This div will act as a flex container */}
            <Link
              target="_blank"
              to={node.asset.url}
              sx={style}
              rel="noopener noreferrer"
              download
            >
              {node.asset.filename.split(".")[0]}
            </Link>
          </div>
        );
      }

      return null;
    },
    block(props) {
      switch (props.node.style) {
        case "h1":
          return <Themed.h1 sx={headingSx}>{props.children}</Themed.h1>;
        case "h2":
          return <Themed.h2 sx={headingSx}>{props.children}</Themed.h2>;
        case "h3":
          return <Themed.h3 sx={headingSx}>{props.children}</Themed.h3>;
        case "h4":
          return <Themed.h4 sx={headingSx}>{props.children}</Themed.h4>;
        case "h5":
          return <Themed.h5 sx={headingSx}>{props.children}</Themed.h5>;
        case "h6":
          return <Themed.h6 sx={headingSx}>{props.children}</Themed.h6>;
        case "blockquote":
          return (
            <Themed.blockquote
              sx={{
                my: 4,
                px: 3,
                py: 3,
                borderLeft: "4px solid",
                borderColor: "primary",
                backgroundColor: "lightgray",
                borderRadius: "8px",
                color: "darkgray",
                fontStyle: "italic",
              }}
            >
              {props.children}
            </Themed.blockquote>
          );
        default:
          return <Themed.p sx={paragraphSx}>{props.children}</Themed.p>;
      }
    },
  },
  list: ({ type, children }) => {
    const as = type === "number" ? "ol" : "ul";
    return (
      <Box
        as={as}
        sx={{
          ...listSx,
          listStyleType: type === "number" ? "decimal" : "disc",
        }}
      >
        {children}
      </Box>
    );
  },
  listItem: ({ children }) => (
    <Box as="li" sx={{ mb: 2, pl: 1 }}>
      {children}
    </Box>
  ),
  marks: {
    link: ({ children, mark }) => (
      <Themed.a
        href={mark.href}
        sx={{
          color: "primary",
          textDecoration: "none",
          borderBottom: "2px solid",
          borderColor: "primary",
          transition: "color 0.2s ease, border-color 0.2s ease",
          "&:hover": {
            color: "secondary",
            borderColor: "secondary",
          },
        }}
      >
        {children}
      </Themed.a>
    ),
    code: ({ children }) => (
      <Box
        as="code"
        sx={{
          fontFamily: "monospace",
          fontSize: "0.95em",
          backgroundColor: "lightgray",
          px: "0.35em",
          py: "0.1em",
          borderRadius: "4px",
        }}
      >
        {children}
      </Box>
    ),
    highlight: ({ children }) => (
      <mark
        sx={{
          backgroundColor: "#fff176",
          color: "#1f1f1f",
          px: "0.2em",
          py: "0.05em",
          borderRadius: "0.2em",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {children}
      </mark>
    ),
  },
};

export default serializers;
