/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Box } from "@theme-ui/components";

const styleWithSubMenu = {
  textDecoration: "none",
  textTransform: "uppercase",
  color: "background",
  p: "1rem"
}

const style = {
  textDecoration: "none",
  textTransform: "uppercase",
  color: "darkgray",
  py: "auto",
  display: "flex",
  alignItems: "center",
  px: "2rem",
  height: "100%",
  ":hover": {
    backgroundColor: "primary",
    cursor: "pointer",
    color: "background"
  }
}

const NavLink = props => {
  let subMenu = props.subMenu;
  // Internal
  if (props.landingPageRoute || props.route) {
    let path = props.landingPageRoute ? `/${props.landingPageRoute.slug.current}` : props.route ? props.route : "/"
    return (
      <Link to={path} sx={subMenu ? styleWithSubMenu : style }>
        <Box>
          {props.title}
        </Box>
      </Link>
    );
  // External
  } else if (props.href) {
    return (
      <a href={props.href} rel="noopener noreferrer" target="_blank" sx={{textDecoration: "none", color: "white"}}>
        <Box sx={subMenu ? styleWithSubMenu : style }>
          {props.title}
        </Box>
      </a>
    )
  } else {
    return (
      <Link to={"/"} sx={subMenu ? styleWithSubMenu : style }>
        <Box>
          {props.title}
        </Box>
      </Link>
    );
  }
};

export default NavLink;