module.exports = {
  colors: {
    text: "#060606",
    background: "#fff",
    primary: "#228dd8",
    secondary: "#e0f",
    muted: "#191919",
    highlight: "#3cf",
    gray: "#f6f5f5",
    purple: "#c0f"
  },
  breakpoints: ["768px", "1025px", "1290px"],
  fonts: {
    base: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif",
    secondary: "Menlo, monospace"
  },
  fontSizes: {
    xs: 12,
    sm: 16,
    md: 32,
    lg: 48,
    xl: 64,
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    bold: 700,
  },
  lineHeights: {
    normal: 1.5,
    medium: 1.4,
  },
  letterSpacings: {
    normal: "0",
    wide: "0.25em",
  },
  text: {
    heading: {
      fontSize: "3rem",
      fontFamily: "base",
      fontWeight: "bold",
    },
    title: {
      fontFamily: "base",
      fontWeight: "medium",
      lineHeight: "medium",
      fontSize: ["md", "lg"],
    },
    body: {
      fontFamily: "base",
      fontWeight: "normal",
      lineHeight: "normal",
      fontSize: "sm",
    },
    label: {
      fontFamily: "secondary",
      fontWeight: "normal",
      lineHeight: "normal",
      fontSize: "xs",
      letterSpacing: "wide",
      textTransform: "uppercase",
    },
  },
  buttons: {
    primary: {
      color: "white",
      bg: "primary",
      "&:hover": {
        color: "primary",
        bg: "white",
      },
    },
    secondary: {
      color: "text",
      bg: "secondary",
      "&:hover": {
        color: "secondary",
        bg: "text",
      },
    },
  },
  styles: {
    root: {
      fontFamily: "base",
    },
    table: {
      width: "100%",
      my: 4,
      borderCollapse: "separate",
      borderSpacing: 0,
      "th,td": {
        textAlign: "left",
        py: "4px",
        pr: "4px",
        pl: 0,
        borderColor: "muted",
        borderBottomStyle: "solid"
      }
    },
    th: {
      verticalAlign: "bottom",
      borderBottomWidth: "2px"
    },
    td: {
      verticalAlign: "top",
      borderBottomWidth: "1px"
    },
    img: {
      maxWidth: "100%"
    },
  },
}