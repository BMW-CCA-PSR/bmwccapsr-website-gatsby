/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Box } from "@theme-ui/components";
import { OutboundLink } from "gatsby-plugin-google-gtag"
import { useLocation } from "@reach/router";

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
  const location = useLocation();
  let subMenu = props.subMenu;
  // Internal
  if (props.landingPageRoute || props.route) {
    let path = props.landingPageRoute ? `/${props.landingPageRoute.slug.current}` : props.route ? props.route : "/"
    const isActive =
      !subMenu &&
      (path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path));
    const activeStyle = isActive
      ? { backgroundColor: "primary", color: "background" }
      : {};
    const linkStyle = subMenu
      ? { ...styleWithSubMenu, display: "block", width: "100%" }
      : style;
    return (
      <Link
        to={path}
        sx={{
          ...linkStyle,
          ...activeStyle
        }}
      >
        <Box>
          {props.title}
        </Box>
      </Link>
    );
  // External
  } else if (props.href) {
    return (
      <OutboundLink href={props.href} rel="noopener noreferrer" target="_blank" sx={{textDecoration: "none", color: "white"}}>
        <Box sx={subMenu ? styleWithSubMenu : style }>
          {props.title}
        </Box>
      </OutboundLink>
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
