/** @jsxImportSource theme-ui */
import React from "react";
import { Box } from "@theme-ui/components";

const BoxIcon = ({ sx, ...props }) => {
  return (
    <Box
      {...props}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 16px)",
        gridTemplateRows: "repeat(2, 16px)",
        gridColumnGap: "0px",
        gridRowGap: "0px",
        ...sx,
      }}
    >
      <Box
        sx={{
          backgroundColor: "primary",
        }}
      />
      <Box />
      <Box />
      <Box
        sx={{
          backgroundColor: "primary",
        }}
      />
    </Box>
  );
};

const BoxIconFlipped = ({ sx, ...props }) => {
  return (
    <Box
      {...props}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 16px)",
        gridTemplateRows: "repeat(2, 16px)",
        gridColumnGap: "0px",
        gridRowGap: "0px",
        ...sx,
      }}
    >
      <Box />
      <Box
        sx={{
          backgroundColor: "primary",
        }}
      />
      <Box
        sx={{
          backgroundColor: "primary",
        }}
      />
      <Box />
    </Box>
  );
};

const BoxIconTitleLockup = ({ text, sx, trailingSx, iconSx, ...props }) => {
  const titleString = String(text || "");
  const titleMatch = titleString.match(/^(.*\S)\s+(\S+)$/);
  const leadingText = titleMatch ? titleMatch[1] : "";
  const trailingText = titleMatch ? titleMatch[2] : titleString;

  return (
    <Box as="span" {...props} sx={{ ...sx }}>
      {leadingText ? `${leadingText} ` : null}
      <Box
        as="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          ...trailingSx,
        }}
      >
        <Box as="span">{trailingText}</Box>
        <BoxIcon
          as="span"
          sx={{
            display: "inline-grid",
            ml: "0.5rem",
            verticalAlign: "middle",
            ...iconSx,
          }}
        />
      </Box>
    </Box>
  );
};

export { BoxIcon, BoxIconFlipped, BoxIconTitleLockup };
