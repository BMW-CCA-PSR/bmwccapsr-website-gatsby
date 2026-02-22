/** @jsxImportSource theme-ui */
import React from "react";
import { useEffect, useState } from "react";
import ReactMapGL from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Pin from "./event-map-marker";

function EventMap(props) {
  const [viewport, setViewport] = useState({
    latitude: props.location.lat,
    longitude: props.location.lng,
    zoom: 14,
  });
  useEffect(() => {
    setViewport((prev) => ({
      ...prev,
      latitude: props.location.lat,
      longitude: props.location.lng,
    }));
  }, [props.location.lat, props.location.lng]);

  return (
    <ReactMapGL
      {...viewport}
      style={{ width: "100%", height: "100%" }}
      mapboxAccessToken={process.env.GATSBY_SANITY_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      onMove={(event) => setViewport(event.viewState)}
      // disable all map interactions
      scrollZoom={false}
      dragPan={false}
      boxZoom={false}
      keyboard={false}
      dragRotate={false}
      doubleClickZoom={false}
      touchZoomRotate={false}
    >
      <Pin {...props} />
    </ReactMapGL>
  );
}

export default EventMap;
