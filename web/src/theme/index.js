module.exports = {
  colors: {
    text: "#060606",
    background: "#fff",
    primary: "#228dd8",
    heading: "#e0f",
    muted: "#191919",
    highlight: "#3cf",
    gray: "#f6f5f5",
  },
  breakpoints: ["768px", "1025px", "1290px"],
  fonts: {
    body: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif",
    heading: "inherit",
    monospace: 'Menlo, monospace',
  },
  fontSizes: {
    xs: 12,
    sm: 16,
    md: 28,
    lg: 48,
    xl: 64,
  },
  fontWeights: {
    body: 400,
    heading: 500,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.4,
  },
  letterSpacings: {
    normal: "0",
    wide: "0.25em",
    tight: "-.025em"
  },
  text: {
    heading: {
      fontSize: "lg",
      fontFamily: "heading",
      fontWeight: "bold",
    },
    title: {
      fontFamily: "body",
      fontWeight: "heading",
      lineHeight: "heading",
      fontSize: ["md", "lg"],
    },
    body: {
      fontFamily: "body",
      fontWeight: "body",
      lineHeight: "body",
      fontSize: "sm",
    },
    label: {
      fontFamily: "heading",
      fontWeight: "body",
      lineHeight: "body",
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
    heading: {
      color: "text",
      bg: "heading",
      "&:hover": {
        color: "heading",
        bg: "text",
      },
    },
  },
  styles: {
    root: {
      fontFamily: "body",
    },
    h1: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: "xl"
    },
    h2: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: "lg"
    },
    h3: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: "md"
    },
    h4: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: "sm"
    },
    h5: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: "xs"
    },
    h6: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 10
    },
    p: {
      color: 'text',
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body'
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
    li: {
      margin: "0px",
      padding: "0px"
    }
  },
}