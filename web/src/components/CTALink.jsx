/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Button } from "@theme-ui/components";
import { OutboundLink } from "gatsby-plugin-google-gtag"

var style = {
  textTransform: "uppercase",
  textDecoration: "none",
  fontSize: 15,
  backgroundColor: "primary",
  border: "none",
  color: "white",
  py: "10px",
  px: "22px",
  borderRadius: "4px",
  letterSpacing: "0.08em",
  transition: "background-color 0.3s ease-out, transform 0.3s ease-out",
  boxShadow: "0 10px 18px -6px rgba(0, 0, 0, 0.25)",
  "&:hover":{
    color: "white",
    bg: "highlight",
    transform: "translateY(-1px)"
  }
}

const CTALink = props => {
  // Internal
  if (props.landingPageRoute || props.route) {
    let path = props.landingPageRoute ? `/${props.landingPageRoute.slug.current}` : props.route ? props.route : "/"
    return (
      <Link to={path}>
        <Button sx={style}>
          {props.title}
        </Button>
      </Link>
    );
  // External
  } else if (props.link) {
    return (
      <OutboundLink href={props.link} rel="noopener noreferrer" target="_blank" sx={{textDecoration: "none", color: "white"}}>
        <Button sx={style}>
          {props.title}
        </Button>
      </OutboundLink>
    )
  }
};

export default CTALink;
