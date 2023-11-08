/** @jsxImportSource theme-ui */
import { Themed } from "theme-ui"
import React from "react";
import { Link } from "gatsby";
import ReactPlayer from "react-player";
import InstagramEmbed from "react-instagram-embed";
import SanityImage from "gatsby-plugin-sanity-image"
import { Box, Text } from '@theme-ui/components';

var style = {
  textDecoration: "none",
  textTransform: "uppercase",
  fontSize: 15,
  backgroundColor: "primary",
  border: "none",
  color: "white",
  mx: [0,0,"1rem","1rem"],
  py: "8px",
  my: "5px",
  px: "20px",
  position: "relative",
  textAlign: "center",
  borderRadius: "4px",
  transition: "background-color 0.5s ease-out",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  "&:hover":{
    color: "white",
    bg: "highlight",
  }
}

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
          variant: "styles.p", 
          py: "1rem", 
          px: "0.5rem", 
          color: `black`
        }}>{node.caption}</Text>
      </Box>,
    videoEmbed: ({ node }) => 
    <div sx={{mx: "auto", display: "flex", position: "relative", paddingTop: "56.25%", width: ["92vw", "92vw", "50vw", "50vw"]}}>
      <ReactPlayer sx={{position: "absolute", top: 0}} url={node.url} width="100%" height="100%" controls />
    </div>,
    instagram: ({ node }) => {
      if (!node.url) return null;
      return <InstagramEmbed url={node.url} />;
    },
    file: ({ node }) => {
    
      if (node.asset) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}> {/* This div will act as a flex container */}
          <Link 
            target="_blank"
            to={node.asset.url} 
            sx={style}
            rel="noopener noreferrer"
            download
          >
            {node.asset.title}
          </Link>
          </div>
        );
      }
    
      return null;
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