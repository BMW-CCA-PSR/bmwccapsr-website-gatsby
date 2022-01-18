/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";

const MobileNavLink = props => {
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
    const ref = props.link ? props.link : props.href
    return (
      <a 
      href={ref} 
      target="_blank" 
      rel="noopener noreferrer"
      sx={{
        textDecoration: "none",
        color: "text",
        display: "block",
        padding: "0.5rem",
        height: "100%",
      }}
      >
        {props.title}
      </a>
    );
  }

  return (
    <Link
      to={link}
      sx={{
        textDecoration: "none",
        //mx: 2,
        //paddingBottom: 1,
        color: "text",
        display: "block",
        padding: "0.5rem",
        height: "100%",
      }}>
      {props.title}
    </Link>
  );
};

export default MobileNavLink;