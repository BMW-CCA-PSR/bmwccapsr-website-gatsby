/** @jsxImportSource theme-ui */
import React from "react";
import { Marker } from "react-map-gl";
import { StaticImage } from "gatsby-plugin-image";

function Icon() {
  return (
    <StaticImage
      alt="BMW CCA PSR"
      src="../images/map-pin.png"
      placeholder="blurred"
      layout="constrained"
      loading="eager"
    />
  );
}

function Pin(props) {
  return (
    <Marker
      latitude={props.location.lat}
      longitude={props.location.lng}
      captureClick={false}
      draggable={false}
      anchor="bottom"
    >
      <button
        type="button"
        aria-label="Open event details"
        sx={{
          background: "none",
          border: "none",
          p: 0,
          cursor: "pointer",
        }}
        onClick={() => {
          props.openPopup(props.data);
        }}
      >
        <Icon />
      </button>
    </Marker>
  );
}

export default Pin;
