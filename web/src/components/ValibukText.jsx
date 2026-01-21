/** @jsxImportSource theme-ui */
import React from "react";
import { Box } from "theme-ui";

const valibukStack =
  "\"Valibuk\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif";

const ValibukText = ({ as = "span", sx, ...props }) => (
  <Box as={as} sx={{ fontFamily: valibukStack, ...sx }} {...props} />
);

export default ValibukText;
