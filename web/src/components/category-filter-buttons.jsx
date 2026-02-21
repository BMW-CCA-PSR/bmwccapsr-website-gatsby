/** @jsxImportSource theme-ui */
import React from "react";
import { Box, Button, Text } from "@theme-ui/components";

const normalizeCategoryValue = (category) => {
  if (typeof category === "string" || typeof category === "number") {
    return category;
  }
  return category?.value;
};

const normalizeCategoryLabel = (category) => {
  if (typeof category === "string" || typeof category === "number") {
    return category;
  }
  return category?.label ?? category?.value;
};

const CategoryFilterButtons = ({
  categories = [],
  selectedCategories = [],
  onChange,
  showDivider = false,
  showAll = true,
  allValue = "All",
  allLabel = "All",
  allSelected,
  onAllToggle,
  onSelectAll,
  layout = "wrap",
  children
}) => {
  const handleToggle = (category) => {
    if (!onChange) return;
    const value = normalizeCategoryValue(category);
    if (value === allValue) {
      if (onAllToggle) {
        onAllToggle();
        return;
      }
      if (onSelectAll) {
        onSelectAll();
        return;
      }
      onChange([]);
      return;
    }
    const isSelected = selectedCategories.includes(value);
    const nextSelection = isSelected
      ? selectedCategories.filter((item) => item !== value)
      : [...selectedCategories, value];
    onChange(nextSelection);
  };

  const containerStyles =
    layout === "inline"
      ? { display: "contents" }
      : { display: "flex", flexWrap: "wrap", gap: "0.5rem" };

  return (
    <Box sx={containerStyles}>
      {categories.map((category) => {
        const value = normalizeCategoryValue(category);
        const rawLabel = normalizeCategoryLabel(category);
        const label = value === allValue ? allLabel : rawLabel;
        if (!showAll && value === allValue) {
          return null;
        }
        const isActive =
          value === allValue
            ? typeof allSelected === "boolean"
              ? allSelected
              : selectedCategories.length === 0
            : selectedCategories.includes(value);
        return (
          <Button
            key={value}
            onClick={() => handleToggle(category)}
            sx={{
              variant: "buttons.primary",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              bg: isActive ? "primary" : "background",
              color: isActive ? "white" : "text",
              borderRadius: "999px",
              px: "1rem",
              py: 0,
              height: "34px",
              lineHeight: 1,
              fontSize: "xs",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              "&:hover": {
                bg: isActive ? "primary" : "highlight",
                color: "white"
              }
            }}
          >
            {label}
          </Button>
        );
      })}
      {children && showDivider && (
        <Text
          sx={{
            variant: "text.label",
            color: "darkgray",
            px: "0.25rem",
            alignSelf: "center",
            display: ["none", "inline-flex"]
          }}
        >
          |
        </Text>
      )}
      {children}
    </Box>
  );
};

export default CategoryFilterButtons;
