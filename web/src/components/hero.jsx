/** @jsxImportSource theme-ui */
import React from "react";
import PortableText from "./portableText";
import clientConfig from "../../client-config";
import CTALink from "./CTALink";
import SanityImage from "gatsby-plugin-sanity-image"
import { Heading, Container, Flex, Box, Text } from "theme-ui"

function Hero(props) {
  const image = props.illustration.image
  console.log(image)
  return (
    // outer container div
    <div
      sx={{
        width: "100%",
        height: 500,
        position: "relative",
      }}>
      {/* background image component */}
      <SanityImage {...image} width={1440}
        sx={{ 
          position: "absolute", 
          width: "100%", 
          height: "100%", 
          objectFit: "cover",
          zIndex: "-1",
        }} />
        {/* inner text component / content div */}
        <div sx={{
          p: ["20px", "50px", "100px"],
          paddingRight: ["20px", "50px", "100px", "400px"],
        }}>
          <Text variant="text.label">{props.label}</Text>
          <Heading variant="styles.h1">{props.heading}</Heading>
          <div sx={{
            variant: "styles.h3",
          }}>
            <PortableText blocks={props.tagline} />
          </div>
          {props.cta && props.cta.title && (
            <CTALink {...props.cta} />
          )}
          </div>
    </div>
  );
}

export default Hero;