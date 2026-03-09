/** @jsxImportSource theme-ui */
import React from "react";
import { Box, Button, Flex, Text } from "@theme-ui/components";
import { FiChevronDown } from "react-icons/fi";

const FilterPanel = ({
  title = "Filter",
  children,
  defaultExpanded = false,
  autoExpand = false,
  forceExpanded = false,
  hideHeader = false,
  containerSx = {},
  bodySx = {},
  tabSx = {},
}) => {
  const [isExpanded, setIsExpanded] = React.useState(
    Boolean(defaultExpanded || autoExpand),
  );
  const previousAutoExpandRef = React.useRef(Boolean(autoExpand));

  React.useEffect(() => {
    if (forceExpanded) return;
    if (autoExpand && !previousAutoExpandRef.current) {
      setIsExpanded(true);
    }
    previousAutoExpandRef.current = Boolean(autoExpand);
  }, [autoExpand, forceExpanded]);

  const panelExpanded = forceExpanded ? true : isExpanded;

  return (
    <Box
      sx={{
        ...containerSx,
      }}
    >
      <Box
        sx={{
          borderRadius: "14px",
          overflow: "hidden",
          bg: "lightgray",
        }}
      >
        {!hideHeader && (
          <Button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={panelExpanded}
            sx={{
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              px: "1rem",
              py: "0.45rem",
              borderRadius: 0,
              border: "none",
              borderBottom: "none",
              bg: "lightgray",
              color: "text",
              fontSize: "sm",
              fontWeight: "heading",
              lineHeight: 1.1,
              cursor: "pointer",
              "&:hover": {
                bg: "muted",
              },
              ...tabSx,
            }}
          >
            <Text as="span" sx={{ fontSize: "inherit", color: "inherit" }}>
              {title}
            </Text>
            <Flex
              as="span"
              sx={{
                transition: "transform 180ms ease",
                transform: panelExpanded ? "rotate(180deg)" : "rotate(0deg)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiChevronDown size={16} />
            </Flex>
          </Button>
        )}
        <Box
          sx={{
            maxHeight: panelExpanded ? "1200px" : 0,
            opacity: panelExpanded ? 1 : 0,
            px: panelExpanded ? ["0.75rem", "0.9rem", "1rem"] : 0,
            pt: panelExpanded ? ["0.6rem", "0.65rem", "0.75rem"] : 0,
            pb: panelExpanded ? ["0.45rem", "0.5rem", "0.55rem"] : 0,
            pointerEvents: panelExpanded ? "auto" : "none",
            transition:
              "max-height 220ms ease, opacity 180ms ease, padding 180ms ease",
            ...bodySx,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default FilterPanel;
