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
  //fontSize: 15,
  backgroundColor: "primary",
  border: "none",
  color: "white",
  p: "0.5rem"
  //py: ".75rem",
  //px: "1.3rem",
}

const MobileCTALink = props => {
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

export default MobileCTALink;