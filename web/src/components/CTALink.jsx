/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Button } from "@theme-ui/components";


var style = {
  textTransform: "uppercase",
  textDecoration: "none",
  maxWidth: "100px",
  fontSize: 15,
  backgroundColor: "primary",
  border: "none",
  wordWrap: "break-word",
  color: "white",
  py: "8px",
  px: "20px",
  borderRadius: "4px",
  transition: "background-color 0.5s ease-out",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  "&:hover":{
    color: "white",
    bg: "secondary",
  }
}

const CTALink = props => {
  console.log(props)
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
      <a href={props.link} sx={{textDecoration: "none", color: "white"}}>
        <Button sx={style}>
          {props.title}
        </Button>
      </a>
    )
  }
};

export default CTALink;