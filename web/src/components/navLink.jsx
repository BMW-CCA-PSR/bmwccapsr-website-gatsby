/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Box } from "@theme-ui/components";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import { useLocation } from "@reach/router";

const fixedSlantClip =
  "polygon(var(--nav-slant-size) 0, 100% 0, calc(100% - var(--nav-slant-size)) 100%, 0 100%)";

const styleWithSubMenu = {
  textDecoration: "none",
  textTransform: "none",
  color: "background",
  py: "0.8rem",
  px: "0.9rem",
};

const style = {
  textDecoration: "none",
  textTransform: "uppercase",
  color: "darkgray",
  py: "auto",
  display: "flex",
  alignItems: "center",
  px: "1.35rem",
  height: "100%",
  position: "relative",
  isolation: "isolate",
  "--nav-slant-size": "14px",
  "--nav-bg-opacity": 0,
  transition: "color 160ms ease",
  "& .nav-link-content": {
    position: "relative",
    zIndex: 1,
    display: "block",
    maxWidth: "9.25ch",
    lineHeight: 1.05,
    whiteSpace: "normal",
    textAlign: "center",
    "&::after": {
      content: '""',
      display: "block",
      width: "100%",
      height: "2px",
      mt: "0.22rem",
      borderRadius: "999px",
      bg: "currentColor",
      opacity: 0,
      transform: "scaleX(0.72)",
      transformOrigin: "center",
      transition: "opacity 160ms ease, transform 160ms ease",
    },
    "&.nav-link-content--active::after": {
      opacity: 1,
      transform: "scaleX(1)",
    },
  },
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundColor: "primary",
    clipPath: fixedSlantClip,
    WebkitClipPath: fixedSlantClip,
    opacity: "var(--nav-bg-opacity)",
    transition: "opacity 160ms ease",
    zIndex: 0,
  },
  ":hover": {
    cursor: "pointer",
    color: "background",
    "--nav-bg-opacity": 1,
  },
};

const normalizePath = (value) => {
  if (!value) return "/";
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
};

const volunteerStyle = {
  ...style,
  color: "background",
  backgroundColor: "primary",
  clipPath: fixedSlantClip,
  WebkitClipPath: fixedSlantClip,
  px: "1.6rem",
  mx: "0.35rem",
  transition: "background-color 160ms ease",
  ":hover": {
    backgroundColor: "secondary",
    color: "background",
    cursor: "pointer",
  },
};

const volunteerNewBadgeStyle = {
  position: "absolute",
  top: "3px",
  right: "8px",
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
  pointerEvents: "none",
  zIndex: 2,
  WebkitTextStroke: 0,
  textShadow: "none",
};

const NavLink = (props) => {
  const location = useLocation();
  let subMenu = props.subMenu;
  const handleVolunteerHoverChange = props.onVolunteerHoverChange;
  const handleNonVolunteerHoverChange = props.onNonVolunteerHoverChange;
  // Internal
  if (props.landingPageRoute || props.route) {
    let path = props.landingPageRoute
      ? `/${props.landingPageRoute.slug.current}`
      : props.route
      ? props.route
      : "/";
    const normalizedPath = normalizePath(path);
    const isVolunteerButton = !subMenu && normalizedPath === "/volunteer";
    const isActive =
      !subMenu &&
      (path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path));
    const activeStyle = isActive
      ? isVolunteerButton
        ? {
            backgroundColor: "secondary",
            color: "background",
            WebkitTextStroke: "0.35px currentColor",
            textShadow: "0 0 0.01px currentColor",
          }
        : {
            color: "background",
            "--nav-bg-opacity": 1,
            WebkitTextStroke: "0.35px currentColor",
            textShadow: "0 0 0.01px currentColor",
          }
      : {};
    const linkStyle = subMenu
      ? { ...styleWithSubMenu, display: "block", width: "100%" }
      : isVolunteerButton
      ? volunteerStyle
      : style;
    return (
      <Link
        to={path}
        onMouseEnter={() => {
          if (subMenu) return;
          if (isVolunteerButton) {
            if (handleVolunteerHoverChange) handleVolunteerHoverChange(true);
            if (handleNonVolunteerHoverChange)
              handleNonVolunteerHoverChange(false);
          } else {
            if (handleVolunteerHoverChange) handleVolunteerHoverChange(false);
            if (handleNonVolunteerHoverChange)
              handleNonVolunteerHoverChange(true);
          }
        }}
        onMouseLeave={() => {
          if (subMenu) return;
          if (isVolunteerButton) {
            if (handleVolunteerHoverChange) handleVolunteerHoverChange(false);
          } else if (handleNonVolunteerHoverChange) {
            handleNonVolunteerHoverChange(false);
          }
        }}
        onFocus={() => {
          if (subMenu) return;
          if (isVolunteerButton) {
            if (handleVolunteerHoverChange) handleVolunteerHoverChange(true);
            if (handleNonVolunteerHoverChange)
              handleNonVolunteerHoverChange(false);
          } else {
            if (handleVolunteerHoverChange) handleVolunteerHoverChange(false);
            if (handleNonVolunteerHoverChange)
              handleNonVolunteerHoverChange(true);
          }
        }}
        onBlur={() => {
          if (subMenu) return;
          if (isVolunteerButton) {
            if (handleVolunteerHoverChange) handleVolunteerHoverChange(false);
          } else if (handleNonVolunteerHoverChange) {
            handleNonVolunteerHoverChange(false);
          }
        }}
        sx={{
          ...linkStyle,
          ...activeStyle,
        }}
      >
        <Box
          className={`nav-link-content${
            isActive ? " nav-link-content--active" : ""
          }`}
        >
          {props.title}
        </Box>
        {isVolunteerButton && (
          <Box as="span" sx={volunteerNewBadgeStyle}>
            new
          </Box>
        )}
      </Link>
    );
    // External
  } else if (props.href) {
    return (
      <OutboundLink
        href={props.href}
        rel="noopener noreferrer"
        target="_blank"
        sx={{ textDecoration: "none", color: "white" }}
      >
        <Box sx={subMenu ? styleWithSubMenu : style}>{props.title}</Box>
      </OutboundLink>
    );
  } else {
    return (
      <Link to={"/"} sx={subMenu ? styleWithSubMenu : style}>
        <Box>{props.title}</Box>
      </Link>
    );
  }
};

export default NavLink;
