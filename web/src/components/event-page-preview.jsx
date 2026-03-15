/** @jsxImportSource theme-ui */
import React from "react";
import EventCard from "./event-card";

function EventPagePreview(props) {
  const { variant, compactMobile, ...event } = props;
  return (
    <EventCard event={event} variant={variant} compactMobile={compactMobile} />
  );
}

export default EventPagePreview;
