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

const normalizeCategoryIcon = (category) => {
  if (typeof category === "string" || typeof category === "number") {
    return null;
  }
  return category?.icon || null;
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
  stretchColumns = 4,
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
      : layout === "stretch"
        ? {
            display: "grid",
            gridTemplateColumns: [
              "1fr",
              "repeat(2, minmax(0, 1fr))",
              `repeat(${Math.max(1, Number(stretchColumns) || 1)}, minmax(0, 1fr))`,
            ],
            gap: "0.5rem",
            width: "100%",
          }
        : { display: "flex", flexWrap: "wrap", gap: "0.5rem" };

  return (
    <Box sx={containerStyles}>
      {categories.map((category) => {
        const value = normalizeCategoryValue(category);
        const rawLabel = normalizeCategoryLabel(category);
        const Icon = normalizeCategoryIcon(category);
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
              gap: "0.35rem",
              width: layout === "stretch" ? "100%" : "auto",
              bg: isActive ? "secondary" : "background",
              color: isActive ? "white" : "text",
              border: "1px solid",
              borderColor: isActive
                ? "rgba(15,23,42,0.22)"
                : "rgba(15,23,42,0.14)",
              borderRadius: "8px",
              px: "0.9rem",
              py: 0,
              height: "34px",
              lineHeight: 1,
              fontSize: "xs",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition:
                "background-color 140ms ease, color 140ms ease, border-color 140ms ease",
              "&:hover": {
                bg: isActive ? "primary" : "highlight",
                color: "white",
                borderColor: isActive
                  ? "rgba(15,23,42,0.3)"
                  : "rgba(15,23,42,0.22)",
              },
              "&:active": {
                transform: "translateY(0.5px)",
              },
            }}
          >
            {Icon && <Icon size={13} aria-hidden="true" />}
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
