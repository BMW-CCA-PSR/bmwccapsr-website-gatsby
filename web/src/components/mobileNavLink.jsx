/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Box } from "@theme-ui/components";
import { OutboundLink } from "gatsby-plugin-google-gtag";

const normalizePath = (value) => {
  if (!value) return "/";
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
};

const mobileVolunteerBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "34px",
  height: "16px",
  px: "0.35rem",
  borderRadius: 9999,
  fontSize: "10px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "white",
  fontWeight: "heading",
  lineHeight: 1,
  backgroundImage: "linear-gradient(135deg, #27d07e 0%, #06b7a6 100%)",
  boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(calc(6.2ch), -50%)",
  pointerEvents: "none",
};

const mobileVolunteerLinkStyle = {
  backgroundColor: "primary",
  color: "white",
  borderRadius: "10px",
  mx: "0.75rem",
  my: "0.35rem",
};

const MobileNavLink = (props) => {
  let link = props.route || props.link || props.href || "#";
  if (
    props.landingPageRoute &&
    props.landingPageRoute.slug &&
    props.landingPageRoute.slug.current
  ) {
    link = `/${props.landingPageRoute.slug.current}`;
  }
  const isVolunteerButton =
    !props.link && !props.href && normalizePath(link) === "/volunteer";
  // External
  if (props.link || props.href) {
    const ref = props.link ? props.link : props.href;
    return (
      <OutboundLink
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
      </OutboundLink>
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
        position: "relative",
        ...(isVolunteerButton ? mobileVolunteerLinkStyle : {}),
      }}
    >
      <Box
        as="span"
        sx={{ display: "block", width: "100%", textAlign: "center" }}
      >
        {props.title}
      </Box>
      {isVolunteerButton && (
        <Box as="span" sx={mobileVolunteerBadgeStyle}>
          new
        </Box>
      )}
    </Link>
  );
};

export default MobileNavLink;
