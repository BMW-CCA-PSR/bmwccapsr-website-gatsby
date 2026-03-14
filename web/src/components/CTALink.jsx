/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Button } from "@theme-ui/components";
import { OutboundLink } from "gatsby-plugin-google-gtag";

var style = {
  textDecoration: "none",
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  fontSize: "xs",
  backgroundColor: "primary",
  border: "1px solid",
  borderColor: "rgba(15,23,42,0.22)",
  color: "white",
  py: 0,
  px: "0.95rem",
  height: "34px",
  lineHeight: 1,
  borderRadius: "8px",
  fontWeight: 400,
  letterSpacing: "0.08em",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  transition:
    "background-color 140ms ease, color 140ms ease, border-color 140ms ease",
  boxShadow:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  "&:hover": {
    color: "white",
    bg: "highlight",
    borderColor: "rgba(15,23,42,0.3)",
  },
  "&:active": {
    transform: "translateY(0.5px)",
  },
};

const CTALink = (props) => {
  // Internal
  if (props.landingPageRoute || props.route) {
    let path = props.landingPageRoute
      ? `/${props.landingPageRoute.slug.current}`
      : props.route
      ? props.route
      : "/";
    return (
      <Link to={path}>
        <Button sx={style}>{props.title}</Button>
      </Link>
    );
    // External
  } else if (props.link) {
    return (
      <OutboundLink
        href={props.link}
        rel="noopener noreferrer"
        target="_blank"
        sx={{ textDecoration: "none", color: "white" }}
      >
        <Button sx={style}>{props.title}</Button>
      </OutboundLink>
    );
  }
};

export default CTALink;
