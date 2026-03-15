/** @jsxImportSource theme-ui */
import React, { useEffect, useState } from "react";
import { Box } from "@theme-ui/components";
import { FiCheck, FiLink } from "react-icons/fi";

const scrollMarginTop = ["88px", "92px", "128px", "136px"];

function PermalinkHeading({
  as = "h2",
  id,
  sx,
  children,
  linkText,
  component: HeadingComponent = Box,
  ...rest
}) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return undefined;

    const timeoutId = window.setTimeout(() => {
      setIsCopied(false);
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [isCopied]);

  const handleClick = async () => {
    if (typeof window === "undefined") return;

    const targetUrl = `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setIsCopied(true);
      } catch (_) {
        // Clipboard access can be blocked; keep normal anchor behavior.
      }
    }
  };

  const labelText = linkText || "section";

  return (
    <HeadingComponent
      as={as}
      id={id}
      {...rest}
      sx={{
        position: "relative",
        scrollMarginTop,
        "&:hover .permalink-control, &:focus-within .permalink-control": {
          opacity: 1,
          transform: "translateX(0)",
        },
        ...sx,
      }}
    >
      {children}
      <Box
        as="a"
        href={`#${id}`}
        onClick={handleClick}
        aria-label={`Copy permalink to ${labelText}`}
        title={isCopied ? "Permalink copied" : `Copy permalink to ${labelText}`}
        className="permalink-control"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          ml: "0.45rem",
          width: "1.15em",
          height: "1.15em",
          color: "primary",
          textDecoration: "none",
          verticalAlign: "baseline",
          borderRadius: "999px",
          opacity: 0,
          transform: "translateX(-2px)",
          transition:
            "opacity 160ms ease, transform 160ms ease, color 160ms ease",
          "&:focus-visible": {
            opacity: 1,
            outline: "2px solid",
            outlineColor: "primary",
            outlineOffset: "2px",
          },
          "@media (hover: none)": {
            opacity: 1,
            transform: "none",
          },
          "&:hover": {
            color: "secondary",
          },
        }}
      >
        {isCopied ? <FiCheck size="0.8em" /> : <FiLink size="0.8em" />}
      </Box>
    </HeadingComponent>
  );
}

export default PermalinkHeading;
