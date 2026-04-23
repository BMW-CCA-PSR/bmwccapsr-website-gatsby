/** @jsxImportSource theme-ui */
import React from "react";
import CTALink from "./CTALink";
import { Heading, Text } from "theme-ui";
import { Box } from "@theme-ui/components";
import { BoxIcon } from "./box-icons";
import ContentContainer from "./content-container";
import { buildResponsiveImageAttrs } from "../lib/image-url";

const HERO_CENTER_WIDTH = "1200px";
const HERO_SIDE_FALLOFF = "320px";
const HERO_EFFECT_BREAKPOINT = "1050px";
const HERO_CENTER_HALF = "600px";

function Hero(props) {
  const image = props.image;
  const headingText = String(props.heading || "");
  const hasLongMobileHeading = headingText.trim().length > 50;
  const colorOverride =
    typeof props.colors === "string" ? props.colors : props.colors?.value;
  let fontColor = "#000";
  if (
    props.image &&
    props.image.asset &&
    props.image.asset.metadata &&
    props.image.asset.metadata.palette
  ) {
    fontColor = props.image.asset.metadata.palette.dominant.foreground;
  }
  fontColor = colorOverride ? colorOverride : fontColor;
  const imageAttrs = image?.asset
    ? buildResponsiveImageAttrs(image, {
        widths: [480, 768, 1024, 1280, 1440, 1680],
        sizes: "100vw",
        quality: 68,
      })
    : null;
  const imageAlt = image?.alt || props.heading || "";
  const imageLoading = props.isHomepage ? "eager" : "lazy";
  const imageFetchPriority = props.isHomepage ? "high" : undefined;
  return (
    <div
      sx={{
        width: "100%",
        height: props.isHomepage ? [430, 450, 480, 480] : [320, 340, 360, 360],
        position: "relative",
      }}
    >
      {/* background image component */}
      {imageAttrs?.src && (
        <>
          <Box
            as="img"
            src={imageAttrs.src}
            srcSet={imageAttrs.srcSet}
            sizes={imageAttrs.sizes}
            loading={imageLoading}
            fetchPriority={imageFetchPriority}
            decoding="async"
            alt={imageAlt}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              zIndex: "-1",
              [`@media screen and (min-width: ${HERO_EFFECT_BREAKPOINT})`]: {
                display: "none",
              },
            }}
          />
          <Box
            sx={{
              display: "none",
              position: "absolute",
              inset: 0,
              zIndex: "-1",
              overflow: "hidden",
              [`@media screen and (min-width: ${HERO_EFFECT_BREAKPOINT})`]: {
                display: "block",
              },
            }}
          >
            <Box
              as="img"
              src={imageAttrs.src}
              srcSet={imageAttrs.srcSet}
              sizes={imageAttrs.sizes}
              loading={imageLoading}
              fetchPriority={imageFetchPriority}
              decoding="async"
              alt=""
              aria-hidden="true"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                filter: "blur(11px)",
                transform: "scale(1.03)",
              }}
            />
            <Box
              as="img"
              src={imageAttrs.src}
              srcSet={imageAttrs.srcSet}
              sizes={imageAttrs.sizes}
              loading={imageLoading}
              fetchPriority={imageFetchPriority}
              decoding="async"
              alt=""
              aria-hidden="true"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                filter: "none",
                transform: "none",
                WebkitMaskImage: `linear-gradient(
                  90deg,
                  transparent 0,
                  transparent calc(50% - ${HERO_CENTER_HALF} - ${HERO_SIDE_FALLOFF}),
                  rgba(0, 0, 0, 0.14) calc(50% - ${HERO_CENTER_HALF} - (${HERO_SIDE_FALLOFF} * 0.72)),
                  rgba(0, 0, 0, 0.32) calc(50% - ${HERO_CENTER_HALF} - (${HERO_SIDE_FALLOFF} * 0.42)),
                  rgba(0, 0, 0, 0.62) calc(50% - ${HERO_CENTER_HALF} - (${HERO_SIDE_FALLOFF} * 0.16)),
                  black calc(50% - ${HERO_CENTER_HALF}),
                  black calc(50% + ${HERO_CENTER_HALF}),
                  rgba(0, 0, 0, 0.62) calc(50% + ${HERO_CENTER_HALF} + (${HERO_SIDE_FALLOFF} * 0.16)),
                  rgba(0, 0, 0, 0.32) calc(50% + ${HERO_CENTER_HALF} + (${HERO_SIDE_FALLOFF} * 0.42)),
                  rgba(0, 0, 0, 0.14) calc(50% + ${HERO_CENTER_HALF} + (${HERO_SIDE_FALLOFF} * 0.72)),
                  transparent calc(50% + ${HERO_CENTER_HALF} + ${HERO_SIDE_FALLOFF}),
                  transparent 100%
                )`,
                maskImage: `linear-gradient(
                  90deg,
                  transparent 0,
                  transparent calc(50% - ${HERO_CENTER_HALF} - ${HERO_SIDE_FALLOFF}),
                  rgba(0, 0, 0, 0.14) calc(50% - ${HERO_CENTER_HALF} - (${HERO_SIDE_FALLOFF} * 0.72)),
                  rgba(0, 0, 0, 0.32) calc(50% - ${HERO_CENTER_HALF} - (${HERO_SIDE_FALLOFF} * 0.42)),
                  rgba(0, 0, 0, 0.62) calc(50% - ${HERO_CENTER_HALF} - (${HERO_SIDE_FALLOFF} * 0.16)),
                  black calc(50% - ${HERO_CENTER_HALF}),
                  black calc(50% + ${HERO_CENTER_HALF}),
                  rgba(0, 0, 0, 0.62) calc(50% + ${HERO_CENTER_HALF} + (${HERO_SIDE_FALLOFF} * 0.16)),
                  rgba(0, 0, 0, 0.32) calc(50% + ${HERO_CENTER_HALF} + (${HERO_SIDE_FALLOFF} * 0.42)),
                  rgba(0, 0, 0, 0.14) calc(50% + ${HERO_CENTER_HALF} + (${HERO_SIDE_FALLOFF} * 0.72)),
                  transparent calc(50% + ${HERO_CENTER_HALF} + ${HERO_SIDE_FALLOFF}),
                  transparent 100%
                )`,
              }}
            />
          </Box>
        </>
      )}
      <div
        sx={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0) 60%), rgba(120, 120, 120, 0.38)",
          height: "100%",
          zIndex: "0",
        }}
      >
        {/* inner text component / content div */}
        <ContentContainer
          sx={{
            px: ["16px", "16px", "50px", "100px"],
            //paddingRight: ["20px", "50px", "100px", "400px"],
            pt: ["120px", "120px", "160px", "160px"],
          }}
        >
          <Text variant="text.label" sx={{ color: `${fontColor}` }}>
            {props.label}
          </Text>
          <Heading
            sx={{
              fontSize: hasLongMobileHeading
                ? ["42px", "46px", "xl", "xl"]
                : ["50px", "50px", "xl", "xl"],
              color: `${fontColor}`,
              lineHeight: ["40px", "60px"],
              textTransform: "none",
            }}
          >
            {props.heading}
            <BoxIcon
              as="span"
              sx={{
                display: "inline-grid",
                ml: "0.5rem",
                verticalAlign: "middle",
              }}
            />
          </Heading>
          <div sx={{ pt: "20px", pb: ["10px", "12px", "20px", "20px"] }}>
            <Text
              variant="styles.h3"
              sx={{ color: `${fontColor}`, fontWeight: 400 }}
            >
              {props.tagline}
            </Text>
          </div>
          {props.cta && props.cta.title && <CTALink {...props.cta} />}
        </ContentContainer>
      </div>
    </div>
  );
}

export default Hero;
