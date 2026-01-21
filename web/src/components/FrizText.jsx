/** @jsxImportSource theme-ui */
import React from "react";
import { Box } from "theme-ui";

const frizStack =
  "\"Friz Quadrata\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif";

const FrizText = ({ as = "span", sx, ...props }) => (
  <Box as={as} sx={{ fontFamily: frizStack, ...sx }} {...props} />
);

export default FrizText;
