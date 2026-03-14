/** @jsxImportSource theme-ui */
import React from "react";
import { Box, Button, Flex, Text } from "@theme-ui/components";
import { FiX } from "react-icons/fi";

export const FilterBox = ({ children, sx = {} }) => (
  <Box
    sx={{
      mt: "0.75rem",
      mb: "1.5rem",
      p: ["1rem", "1.25rem"],
      backgroundColor: "lightgray",
      border: "1px solid",
      borderColor: "black",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      ...sx,
    }}
  >
    {children}
  </Box>
);

export const FilterGrid = ({ children, sx = {} }) => (
  <Box
    sx={{
      display: "grid",
      gap: "0.75rem",
      width: "100%",
      alignItems: "end",
      ...sx,
    }}
  >
    {children}
  </Box>
);

export const FilterField = ({ label, children, sx = {} }) => (
  <Box sx={{ ...sx }}>
    {label ? (
      <Text sx={{ fontSize: "xs", fontWeight: "heading", mb: "0.3rem" }}>
        {label}
      </Text>
    ) : null}
    {children}
  </Box>
);

export const FilterSearchInput = ({
  value,
  onChange,
  placeholder,
  sx = {},
  ...rest
}) => (
  <Box
    as="input"
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    sx={{
      width: "100%",
      border: "1px solid",
      borderColor: "gray",
      borderRadius: "8px",
      px: "0.6rem",
      py: "0.45rem",
      fontSize: "sm",
      bg: "background",
      ...sx,
    }}
    {...rest}
  />
);

export const FilterSelect = ({ children, value, onChange, sx = {}, ...rest }) => (
  <Box
    as="select"
    value={value}
    onChange={onChange}
    sx={{
      width: "100%",
      border: "1px solid",
      borderColor: "gray",
      borderRadius: "8px",
      px: "0.6rem",
      py: "0.45rem",
      fontSize: "xs",
      bg: "background",
      color: "text",
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
);

export const FilterPillButton = ({
  active = false,
  activeBg = "secondary",
  activeHoverBg = "primary",
  sx = {},
  ...props
}) => (
  <Button
    sx={{
      variant: "buttons.primary",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      bg: active ? activeBg : "background",
      color: active ? "white" : "text",
      border: "1px solid",
      borderColor: active ? "rgba(15,23,42,0.22)" : "rgba(15,23,42,0.14)",
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
        bg: active ? activeHoverBg : "highlight",
        color: "white",
        borderColor: active ? "rgba(15,23,42,0.3)" : "rgba(15,23,42,0.22)",
      },
      "&:active": {
        transform: "translateY(0.5px)",
      },
      ...sx,
    }}
    {...props}
  />
);

export const FilterIconClearButton = ({
  disabled = false,
  label = "Clear filters",
  sx = {},
  ...props
}) => (
  <Button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    sx={{
      variant: "buttons.primary",
      width: "34px",
      minWidth: "34px",
      height: "34px",
      p: 0,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      bg: disabled ? "lightgray" : "background",
      color: disabled ? "darkgray" : "text",
      borderRadius: "999px",
      border: "1px solid",
      borderColor: "gray",
      cursor: disabled ? "not-allowed" : "pointer",
      "&:hover": {
        bg: disabled ? "lightgray" : "highlight",
        color: disabled ? "darkgray" : "text",
      },
      ...sx,
    }}
    {...props}
  >
    <FiX size={16} />
  </Button>
);

export const FilterPillRow = ({ children, sx = {} }) => (
  <Flex sx={{ gap: "0.45rem", flexWrap: "wrap", ...sx }}>{children}</Flex>
);

export const FilterInlineRow = ({ children, sx = {} }) => (
  <Flex
    sx={{
      gap: "0.75rem",
      flexWrap: "wrap",
      alignItems: "flex-end",
      overflowX: "visible",
      "& > *": {
        flex: "1 1 180px",
      },
      ...sx,
    }}
  >
    {children}
  </Flex>
);

export const FilterSearchField = ({
  label = "Search",
  value,
  onChange,
  placeholder,
  onClear,
  clearDisabled = false,
  clearLabel = "Clear filters",
  fieldSx = {},
  inputSx = {},
  clearSx = {},
}) => (
  <FilterField label={label} sx={fieldSx}>
    <Box sx={{ position: "relative", width: "100%" }}>
      <FilterSearchInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        sx={{ width: "100%", pr: "2.6rem", ...inputSx }}
      />
      <Box
        as="button"
        type="button"
        aria-label={clearLabel}
        title={clearLabel}
        disabled={clearDisabled}
        onClick={onClear}
        sx={{
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          position: "absolute",
          right: "1px",
          top: "1px",
          bottom: "1px",
          transform: "none",
          width: "38px",
          minWidth: 0,
          height: "calc(100% - 2px)",
          p: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 0,
          borderTopRightRadius: "7px",
          borderBottomRightRadius: "7px",
          border: "none",
          borderLeft: "1px solid",
          borderLeftColor: clearDisabled ? "gray" : "#2357b3",
          backgroundColor: clearDisabled ? "#efefef" : "#2f6fcd !important",
          color: clearDisabled ? "darkgray" : "white !important",
          boxShadow: clearDisabled ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.12)",
          cursor: clearDisabled ? "not-allowed" : "pointer",
          "&:hover": {
            backgroundColor: clearDisabled ? "#efefef" : "#275fb2 !important",
            color: clearDisabled ? "darkgray" : "white !important",
          },
          "&:active": {
            backgroundColor: clearDisabled ? "#efefef" : "#1f4f98 !important",
          },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "#1f4f98",
            outlineOffset: "1px",
          },
          "&[disabled]": {
            backgroundColor: "#efefef !important",
            color: "darkgray !important",
          },
          ...clearSx,
        }}
      >
        <FiX size={15} />
      </Box>
    </Box>
  </FilterField>
);
