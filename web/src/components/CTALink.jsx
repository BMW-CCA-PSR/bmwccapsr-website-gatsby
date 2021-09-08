/** @jsxImportSource theme-ui */
import React from "react";
import { Link, navigate } from "gatsby";

const doNavigate = target => {
  if (!target || !target.length) {
    return;
  }
  const internal = /^\/(?!\/)/.test(target);
  if (internal) {
    navigate(target);
  } else {
    window.location = target;
  }
};
var style = {
  fontSize: 15,
  backgroundColor: "primary",
  border: "none",
  color: "white",
  py: ".75rem",
  px: "1.3rem",
  borderRadius: "10px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  "&:hover":{
    color: "black",
    bg: "highlight",
  }
}

const CTALink = props => {
  let link = props.route || props.link || "#";
  if (
    props.landingPageRoute &&
    props.landingPageRoute.slug &&
    props.landingPageRoute.slug.current
  ) {
    link = `/${props.landingPageRoute.slug.current}`;
  }

  if (props.kind === "button") {
    return (
      <button
        id="navAction"
        sx={style}
        onClick={() => doNavigate(link)}
        className={props.buttonActionClass || ""}
      >
        {props.title}
      </button>
    );
  }

  // External
  if (props.link) {
    return (
      <a href={props.link} target="_blank" rel="noopener noreferrer" sx={style}>
        {props.title}
      </a>
    );
  }

  return (
    <Link to={link} sx={style}>
      {props.title}
    </Link>
  );
};

export default CTALink;