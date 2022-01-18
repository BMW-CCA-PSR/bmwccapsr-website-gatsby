/** @jsxImportSource theme-ui */
import React from "react";
import clientConfig from "../../client-config";
import BlockContent from "@sanity/block-content-to-react";
import serializers from "./serializers";

const PortableText = ({ blocks, color }) => (
  <BlockContent 
    blocks={blocks} 
    serializers={serializers} 
    {...clientConfig.sanity} 
    sx={{
      color: `${color}`
    }} 
  />
);

export default PortableText;