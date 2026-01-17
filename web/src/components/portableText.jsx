/** @jsxImportSource theme-ui */
import React from "react";
import clientConfig from "../../client-config";
import BlockContent from "@sanity/block-content-to-react";
import serializers from "./serializers";
import { Box } from "@theme-ui/components";

function PortableText(props){
  const blocks = props.body
  const color = props.color
  const boxed = props.boxed
  const boxedSx = props.boxedSx
  return (
    <Box
      sx={{
        color: color || "text",
        ...(boxed
          ? {
              backgroundColor: "#f7f7f7",
              borderRadius: "12px",
              px: ["1.25rem", "1.5rem"],
              py: ["1.25rem", "1.5rem"],
              my: 4,
              boxShadow: "0 18px 40px -30px rgba(0, 0, 0, 0.35)",
              width: "100%",
            }
          : {}),
        ...(boxedSx || {}),
      }}
    >
      <BlockContent blocks={blocks} serializers={serializers} {...clientConfig.sanity} />
    </Box>
  );
} 
export default PortableText;
