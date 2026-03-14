/** @jsxImportSource theme-ui */
import React from "react";
import { Badge, Box } from "theme-ui";
import { FiZap } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import {
  zundfolgeFeaturedPillSx,
  zundfolgeNewPillSx,
} from "../lib/zundfolgePills";

const iconWrapSx = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  mr: "0.28rem",
  lineHeight: 1,
  transform: "translateY(-0.5px)",
};

const iconSizeByVariant = {
  featured: 11,
  new: 11,
};

const ZundfolgePill = ({ variant = "new", children }) => {
  const isFeatured = variant === "featured";
  const Icon = isFeatured ? FaStar : FiZap;
  const iconSize = iconSizeByVariant[variant] || 10;

  return (
    <Badge sx={isFeatured ? zundfolgeFeaturedPillSx : zundfolgeNewPillSx}>
      <Box as="span" sx={iconWrapSx}>
        <Icon size={iconSize} aria-hidden="true" />
      </Box>
      <Box as="span">{children}</Box>
    </Badge>
  );
};

export default ZundfolgePill;
