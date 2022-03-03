/** @jsxImportSource theme-ui */
import React from "react";
import { Link, navigate } from "gatsby";
import { OutboundLink } from "gatsby-plugin-google-gtag"

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
  backgroundColor: "primary",
  border: "none",
  color: "white",
  p: "0.5rem"

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
      <OutboundLink href={props.link} target="_blank" rel="noopener noreferrer" sx={style}>
        {props.title}
      </OutboundLink>
    );
  }

  return (
    <Link to={link} sx={style}>
      {props.title}
    </Link>
  );
};

export default MobileCTALink;