/** @jsxImportSource theme-ui */
import React from "react";
import CTALink from "./CTALink";
import SanityImage from "gatsby-plugin-sanity-image"
import { Heading, Text } from "theme-ui"
import { BoxIcon } from "./box-icons";
import ContentContainer from "./content-container";

function Hero(props) {
  const image = props.image
  const colorOverride =
    typeof props.colors === "string" ? props.colors : props.colors?.value
  let fontColor = "#000"
  if (
    props.image &&
    props.image.asset &&
    props.image.asset.metadata &&
    props.image.asset.metadata.palette
  ) {
    fontColor = props.image.asset.metadata.palette.dominant.foreground
  }
  fontColor = colorOverride ? colorOverride : fontColor
  return (
    <div
      sx={{
        width: "100%",
        height: props.isHomepage ? 480 : 360,
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
        <div
          sx={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0) 60%), rgba(120, 120, 120, 0.38)",
            height: "100%",
            zIndex: "0"
          }}
        >
        {/* inner text component / content div */}
        <ContentContainer sx={{
          px: ["16px","16px","50px","100px"],
          //paddingRight: ["20px", "50px", "100px", "400px"],
          pt: ["120px", "120px","160px", "160px"]
        }}>
          <Text variant="text.label" sx={{color: `${fontColor}`}}>{props.label}</Text>
          <Heading
            sx={{
              fontSize: ["50px", "xl"],
              color: `${fontColor}`,
              lineHeight: ["40px", "60px"],
              textTransform: "none"
            }}
          >
            {props.heading}
            <BoxIcon
              as="span"
              sx={{
                display: "inline-grid",
                ml: "0.5rem",
                verticalAlign: "middle"
              }}
            />
          </Heading>
          <div sx={{py: "20px"}}>
            <Text variant="styles.h3" sx={{color: `${fontColor}`, fontWeight: 400}}>
              {props.tagline}
            </Text>
          </div>
          {props.cta && props.cta.title && (
            <CTALink {...props.cta} />
          )}
          </ContentContainer>
        </div>
    </div>
  );
}

export default Hero;
