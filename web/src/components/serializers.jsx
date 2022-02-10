/** @jsxImportSource theme-ui */
import { Themed } from "theme-ui"
import React from "react";
import ReactPlayer from "react-player";
import InstagramEmbed from "react-instagram-embed";
import SanityImage from "gatsby-plugin-sanity-image"
import { Box, Text } from '@theme-ui/components';

const AuthorReference = ({ node }) => {
  if (node && node.author && node.author.name) {
    return <span>{node.author.name}</span>;
  }
  return <></>;
};
const serializers = {
  types: {
    authorReference: AuthorReference,
    mainImage: ({ node }) => 
      <Box sx={{
          backgroundColor: "lightgray",
          padding: '0.5rem',
          borderRadius: "6px"
        }}>
          <SanityImage
          {...node}
          width={300}
          alt={node.alt}
          sx={{
            width: "100%",
            objectFit: "cover",
            borderRadius: "6px"
          }}
        />
        <Text sx={{
          variant: "styles.h5", 
          py: "1rem", 
          px: "0.5rem", 
          color: `black`
        }}>{node.caption}</Text>
      </Box>,
    videoEmbed: ({ node }) => <ReactPlayer className="mt-6 mb-6" url={node.url} controls />,
    instagram: ({ node }) => {
      if (!node.url) return null;
      return <InstagramEmbed url={node.url} className="container mx-auto mt-6 mb-6" />;
    },
    block(props) {
      switch (props.node.style) {
        case "h1":
          return <Themed.h1>{props.children}</Themed.h1>
        case "h2":
          return <Themed.h2>{props.children}</Themed.h2>
        case "h3":
          return <Themed.h3>{props.children}</Themed.h3>
        case "h4":
          return <Themed.h4>{props.children}</Themed.h4>
        case "h5":
          return <Themed.h5>{props.children}</Themed.h5>
        case "h6":
          return <Themed.h6>{props.children}</Themed.h6>
        case "blockquote":
          return <Themed.blockquote>{props.children}</Themed.blockquote>
        default:
          return <Themed.p>{props.children}</Themed.p>
      }
    }
  },
  marks: {
    link: ({ children, mark }) => (
      <Themed.a href={mark.href}>{children}</Themed.a>
    ),
  }
};

export default serializers;