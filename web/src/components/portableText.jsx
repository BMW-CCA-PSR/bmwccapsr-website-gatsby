/** @jsxImportSource theme-ui */
import React from "react";
import clientConfig from "../../client-config";
import BlockContent from "@sanity/block-content-to-react";
import serializers from "./serializers";

function PortableText(props){
  const blocks = props.body
  const color = props.color
  console.log(props)
  return (
  <BlockContent 
    blocks={blocks} 
    serializers={serializers} 
    {...clientConfig.sanity} 
    sx={{
      color: `${color}`
    }} 
  />
  );
} 
export default PortableText;