/** @jsxImportSource theme-ui */
import React from "react";
import { Box, Text } from "@theme-ui/components";

const rowOffsets = ["0%", "-8%", "-3%", "-11%", "-5%", "-10%", "-2%", "-9%"];
const normalizeResponsiveValue = (value, fallbackLength = 1) =>
  Array.isArray(value)
    ? value
    : Array.from({ length: fallbackLength }, () => value);

const addLengths = (base, offset) => {
  if (!offset || offset === "0px" || offset === 0) return base;
  return `calc(${base} + ${offset})`;
};

const subtractLengths = (base, offset) => {
  if (!offset || offset === "0px" || offset === 0) return `-${base}`;
  return `calc(-${base} - ${offset})`;
};

const StylizedLandingHeader = ({
  word,
  color = "primary",
  topInset = ["6.5rem", "6.5rem", "10rem", "10rem"],
  bleedTop = 0,
  minHeight = ["220px", "240px", "260px", "280px"],
  patternViewportInset = 0,
  rowContents,
  rowCount = rowOffsets.length,
  rowRepeatCount = 8,
  textFontSize = ["46px", "58px", "80px", "92px"],
  rowHeight = ["1.35rem", "1.55rem", "1.9rem", "2.1rem"],
  rowGap = ["0.1rem", "0.15rem", "0.2rem", "0.2rem"],
  rowOverflow = "hidden",
  textLineHeight = 0.82,
  textTranslateY = "-44%",
  patternInset = ["-30% -44%", "-30% -44%", "-34% -38%", "-34% -34%"],
  patternTransform = "translateY(-8%) rotate(-45deg)",
  children,
}) => {
  const baseRows =
    rowContents && rowContents.length > 0 ? rowContents : [word.toUpperCase()];
  const textRows = Array.from({ length: rowCount }, (_, index) => {
    return baseRows[index % baseRows.length];
  });
  const topInsetValues = normalizeResponsiveValue(topInset);
  const bleedTopValues = normalizeResponsiveValue(
    bleedTop,
    topInsetValues.length,
  );
  const combinedPaddingTop = topInsetValues.map((value, index) =>
    addLengths(value, bleedTopValues[index]),
  );
  const combinedMarginTop = topInsetValues.map((value, index) =>
    subtractLengths(value, bleedTopValues[index]),
  );

  return (
    <Box
      sx={{
        position: "relative",
        mt: combinedMarginTop,
        pt: combinedPaddingTop,
        transform: [
          "translateY(-0.6rem)",
          "translateY(-0.7rem)",
          "none",
          "none",
        ],
        minHeight,
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: patternViewportInset,
          pointerEvents: "none",
          overflow: "hidden",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: patternInset,
            transform: patternTransform,
            transformOrigin: "center",
            display: "grid",
            gridTemplateRows: `repeat(${rowCount}, auto)`,
            gap: rowGap,
            opacity: 0.22,
          }}
        >
          {textRows.map((rowContent, index) => (
            <Box
              key={`${word}-${index}`}
              sx={{
                height: rowHeight,
                overflow: rowOverflow,
                pl: rowOffsets[index % rowOffsets.length],
              }}
            >
              <Text
                sx={{
                  display: "block",
                  whiteSpace: "nowrap",
                  fontSize: textFontSize,
                  lineHeight: textLineHeight,
                  letterSpacing: "0.08em",
                  fontStyle: "italic",
                  fontWeight: "heading",
                  color,
                  transform: `translateY(${textTranslateY})`,
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              >
                {Array.from({ length: rowRepeatCount }, () => rowContent).join(
                  "   ",
                )}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </Box>
  );
};

export default StylizedLandingHeader;
