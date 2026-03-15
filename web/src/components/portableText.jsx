/** @jsxImportSource theme-ui */
import React from "react";
import { Themed } from "theme-ui";
import clientConfig from "../../client-config";
import BlockContent from "@sanity/block-content-to-react";
import serializers from "./serializers";
import { Box } from "@theme-ui/components";
import PermalinkHeading from "./permalink-heading";
import {
  buildPortableTextHeadingIds,
  getPortableTextBlockText,
} from "../lib/permalinkHeadings";

function PortableText(props) {
  const blocks = Array.isArray(props.body) ? props.body : [];
  const color = props.color;
  const boxedSx = props.boxedSx;
  const headingIds = buildPortableTextHeadingIds(blocks);
  const dropCapKey = props.enableDropCap
    ? (() => {
        if (!Array.isArray(blocks)) return null;
        let hasHeading = false;
        for (const block of blocks) {
          if (!block || block._type !== "block") continue;
          const style = block.style || "normal";
          const blockText = Array.isArray(block.children)
            ? block.children.map((child) => child?.text || "").join("")
            : "";
          if (!blockText.trim()) {
            continue;
          }
          if (/^h[1-6]$/.test(style)) {
            hasHeading = true;
            continue;
          }
          if (style === "normal") {
            return hasHeading ? null : block._key;
          }
          // Allow blockquote/other styles to precede the first paragraph.
        }
        return null;
      })()
    : null;
  const dropCapSx = dropCapKey
    ? {
        "::first-letter": {
          float: "left",
          fontSize: ["3.2rem", "3.6rem", "4rem"],
          lineHeight: 0.9,
          fontWeight: 700,
          paddingRight: "0.12em",
          marginTop: "0.05em",
        },
      }
    : {};
  const customSerializers = {
    ...serializers,
    types: {
      ...serializers.types,
      block(props) {
        const headingText = getPortableTextBlockText(props.node);
        const headingId = props.node?._key ? headingIds[props.node._key] : null;

        switch (props.node.style) {
          case "h1":
            return (
              <Themed.h1 sx={{ mt: 4, mb: 3, letterSpacing: "tight" }}>
                {props.children}
              </Themed.h1>
            );
          case "h2":
            return headingId ? (
              <PermalinkHeading
                as="h2"
                id={headingId}
                linkText={headingText}
                component={Themed.h2}
                sx={{ mt: 4, mb: 3, letterSpacing: "tight" }}
              >
                {props.children}
              </PermalinkHeading>
            ) : (
              <Themed.h2 sx={{ mt: 4, mb: 3, letterSpacing: "tight" }}>
                {props.children}
              </Themed.h2>
            );
          case "h3":
            return headingId ? (
              <PermalinkHeading
                as="h3"
                id={headingId}
                linkText={headingText}
                component={Themed.h3}
                sx={{ mt: 4, mb: 3, letterSpacing: "tight" }}
              >
                {props.children}
              </PermalinkHeading>
            ) : (
              <Themed.h3 sx={{ mt: 4, mb: 3, letterSpacing: "tight" }}>
                {props.children}
              </Themed.h3>
            );
          case "h4":
            return headingId ? (
              <PermalinkHeading
                as="h4"
                id={headingId}
                linkText={headingText}
                component={Themed.h4}
                sx={{ mt: 4, mb: 3, letterSpacing: "tight" }}
              >
                {props.children}
              </PermalinkHeading>
            ) : (
              <Themed.h4 sx={{ mt: 4, mb: 3, letterSpacing: "tight" }}>
                {props.children}
              </Themed.h4>
            );
          case "h5":
            return (
              <Themed.h5 sx={{ mt: 4, mb: 3, letterSpacing: "tight" }}>
                {props.children}
              </Themed.h5>
            );
          case "h6":
            return (
              <Themed.h6 sx={{ mt: 4, mb: 3, letterSpacing: "tight" }}>
                {props.children}
              </Themed.h6>
            );
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
          default: {
            const isDropCap = dropCapKey && props.node._key === dropCapKey;
            return (
              <Themed.p
                sx={{
                  mb: 3,
                  lineHeight: "body",
                  ...(isDropCap ? dropCapSx : {}),
                }}
              >
                {props.children}
              </Themed.p>
            );
          }
        }
      },
    },
  };
  return (
    <Box
      sx={{
        color: color || "text",
        ...(boxedSx || {}),
      }}
    >
      <BlockContent
        blocks={blocks}
        serializers={customSerializers}
        {...clientConfig.sanity}
      />
    </Box>
  );
}
export default PortableText;
