/** @jsxImportSource theme-ui */
import React from "react";
import { Container } from "@theme-ui/components";

const ContentContainer = ({ sx, ...props }) => (
  <Container
    {...props}
    sx={{
      maxWidth: ["100%", "100%", "1200px", "1200px"],
      mx: "auto",
      width: "100%",
      ...sx
    }}
  />
);

export default ContentContainer;
