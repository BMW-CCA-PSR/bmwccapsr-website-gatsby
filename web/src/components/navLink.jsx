/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";

const NavLink = props => {
  let subMenu = props.subMenu;
  let link = props.route || props.link || props.href || "#";
  if (
    props.landingPageRoute &&
    props.landingPageRoute.slug &&
    props.landingPageRoute.slug.current
  ) {
    link = `/${props.landingPageRoute.slug.current}`;
  }
  // External
  if (props.link || props.href) {
    return (
      <a href={props.link} target="_blank" rel="noopener noreferrer">
        {props.title}
      </a>
    );
  }

  return (
    <Link
      to={link}
      sx={subMenu ? {
        textDecoration: "none",
        textTransform: "uppercase",
        color: "background"
      } : {
        textDecoration: "none",
        textTransform: "uppercase",
        color: "darkgray",
        display: "flex",
        alignItems: "center",
        px: "8px",
        height: "100%",
        ":hover": {
          backgroundColor: "primary",
          cursor: "pointer",
          color: "background"
        },
      }}>
      {props.title}
    </Link>
  );
};

export default NavLink;