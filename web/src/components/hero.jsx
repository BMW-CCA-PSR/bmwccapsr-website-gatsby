/** @jsxImportSource theme-ui */
import React from "react";
import PortableText from "./portableText";
import clientConfig from "../../client-config";
import CTALink from "./CTALink";
import { GatsbyImage } from 'gatsby-plugin-image'
import { Heading, Container, Flex, Box, Text } from "theme-ui"
import { getGatsbyImageData } from 'gatsby-source-sanity'

const maybeImage = illustration => {
  let img = null;
  if (illustration && illustration.image && illustration.image.asset && !illustration.disabled) {
    const fluidProps = getGatsbyImageData(
      illustration.image.asset._id,
      { maxWidth: 960 },
      clientConfig.sanity
    );

    img = (
      <GatsbyImage image={fluidProps} sx={{width: "100%", z: 50}} alt={illustration.image.alt} />
    );
  }
  return img;
};

function Hero(props) {
  const img = maybeImage(props.illustration);
  return (
    <div sx={{
      width: "100%",
      backgroundColor: "green"
    }}>
      <Flex sx={{
        bg: "yellow",
        px: "0.75rem",
        pt: "0.4rem",
        mx: "auto",
        maxWidth: 768,
        width: "100%",
        flexDirection: ["column", "row"],
      }}>
        {/* Left col */}
        <Flex sx={{
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          textAlign: ["center", "left"],
          mx: "auto",
        }}>
          <Text variant="text.label">{props.label}</Text>
          <Heading variant="styles.h1" sx={{
            my: "1rem",
          }}>{props.heading}</Heading>
          <div sx={{
            variant: "styles.h3",
            pr: "0.5rem",
          }}>
            <PortableText blocks={props.tagline} />
          </div>
          {props.cta && props.cta.title && (
            <div sx={{
              m:"1rem"
            }}>
            <CTALink
              {...props.cta}
            />
            </div>
          )}
        </Flex>
        {/* Right col */}
        <Box sx={{
          width: "100%",
          bg: "red",
          py: "1.5rem",
          textAlign: "center",
        }}>{img}</Box>
      </Flex>
    </div>
  );
}

export default Hero;