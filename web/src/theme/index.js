module.exports = {
  colors: {
    text: "#4d4d4d",
    background: "#fff",
    primary: "#1e94ff",
    secondary: "#0653b6",
    heading: "#e0f",
    highlight: "#3cf",
    lightgray: "#f2f2f2",
    gray: "#777",
    darkgray: "#444444"
  },
  breakpoints: ["480px", "768px", "1025px", "1200px"],
  fonts: {
    body: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif",
    heading: "inherit",
    monospace: 'Menlo, monospace',
  },
  fontSizes: {
    xxs: 12,
    xs: 16,
    sm: 20,
    md: 30,
    lg: 40,
    xl: 64,
  },
  fontWeights: {
    body: 400,
    heading: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.1,
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
      fontWeight: "heading",
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
  badges: {
    primary: {
      color: 'background',
      bg: 'primary',
    },
    outline: {
      color: 'primary',
      bg: 'transparent',
      boxShadow: 'inset 0 0 0 1px',
    },
  },
  styles: {
    root: {
      fontFamily: "body",
    },
    h1: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      letterSpacing: "tight",
      fontWeight: 'heading',
      fontSize: "xl"
    },
    h2: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      letterSpacing: "tight",
      fontWeight: 'heading',
      fontSize: "lg"
    },
    h3: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      letterSpacing: "tight",
      fontWeight: 'heading',
      fontSize: "md"
    },
    h4: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      letterSpacing: "tight",
      fontWeight: 'heading',
      fontSize: "sm"
    },
    h5: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      letterSpacing: "tight",
      fontWeight: 'heading',
      fontSize: "xs"
    },
    h6: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      letterSpacing: "tight",
      fontWeight: 'heading',
      fontSize: "xxs"
    },
    p: {
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
      //maxWidth: "100%"
    },
    li: {
      margin: "0px",
      padding: "0px"
    },
    ul: {
      listStyle: 'none',
      margin: "0px",
      padding: "0px"
    }
  },
}