/** @jsxImportSource theme-ui */
import React from "react";
import { useState } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css'
import  Pin  from "./event-map-marker"

function EventMap(props) {
  const [viewport, setViewport] = useState({
    mapboxApiAccessToken: process.env.GATSBY_SANITY_MAPBOX_TOKEN,
    height: "100%",
    latitude: props.location.lat,
    longitude: props.location.lng,
    zoom: 14,
    // disable all map interactions
    scrollZoom: false,
    boxZoom: false,
    dragPan: false,
    keyboard: false,
    dragRotate: false,
    doubleClickZoom: false,
    touchZoomRotate: false,
  });

  return (
    <ReactMapGL
      {...viewport}
      width="100%"
      mapStyle="mapbox://styles/mapbox/streets-v11"
      onViewportChange={nextViewport => setViewport(nextViewport)}
    >
      <Pin {...props} />
    </ReactMapGL>
  );
}

export default EventMap;
