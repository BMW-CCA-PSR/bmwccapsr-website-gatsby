/** @jsxImportSource theme-ui */
import React from "react";
import { Box } from "theme-ui";

const veronaStack =
  "\"Verona\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif";

const VeronaText = ({ as = "span", sx, ...props }) => (
  <Box as={as} sx={{ fontFamily: veronaStack, fontWeight: 700, ...sx }} {...props} />
);

export default VeronaText;
