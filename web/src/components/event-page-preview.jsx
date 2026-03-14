/** @jsxImportSource theme-ui */
import React from "react";
import EventCard from "./event-card";

function EventPagePreview(props) {
  const { variant, ...event } = props;
  return <EventCard event={event} variant={variant} />;
}

export default EventPagePreview;
