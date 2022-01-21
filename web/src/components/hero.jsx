/** @jsxImportSource theme-ui */
import React from "react";
import PortableText from "./portableText";
import clientConfig from "../../client-config";
import CTALink from "./CTALink";
import SanityImage from "gatsby-plugin-sanity-image"
import { Heading, Container, Flex, Box, Text } from "theme-ui"

function Hero(props) {
  const image = props.image
  let fontColor = "#000"
  if (
    props.image &&
    props.image.asset &&
    props.image.asset.metadata &&
    props.image.asset.metadata.palette
  ) {
    fontColor = props.image.asset.metadata.palette.dominant.foreground
  }
  return (
    <div
      sx={{
        width: "100%",
        height: 550,
        position: "relative",
      }}>
      {/* background image component */}
      {
        props.image &&
        props.image.asset &&
        <SanityImage {...image} width={1440}
          sx={{
            position: "absolute", 
            width: "100%", 
            height: "100%", 
            objectFit: "cover",
            zIndex: "-1",
          }} />
        }
        <div sx={{background: "rgba(0,0,0,0.3)", height: "100%", zIndex: "0"}}>
        {/* inner text component / content div */}
        <div sx={{
          p: ["16px","16px","50px","100px"],
          //paddingRight: ["20px", "50px", "100px", "400px"],
          paddingTop: ["120px", "120px","160px", "160px"]
        }}>
          <Text variant="text.label" sx={{color: `${fontColor}`}}>{props.label}</Text>
          <Heading variant="styles.h1" sx={{color: `${fontColor}`}}>{props.heading}</Heading>
          <div sx={{py: "20px"}}>
            <Text variant="styles.h3" sx={{color: `${fontColor}`}}>{props.tagline}</Text>
          </div>
          {props.cta && props.cta.title && (
            <CTALink {...props.cta} />
          )}
          </div>
        </div>
    </div>
  );
}

export default Hero;