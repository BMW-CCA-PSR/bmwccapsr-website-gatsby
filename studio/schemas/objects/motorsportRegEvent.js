import MotorsportRegEventInput from "../../src/components/MotorsportRegEventInput";

export default {
  name: "motorsportRegEvent",
  type: "object",
  title: "Position event",
  components: {
    input: MotorsportRegEventInput,
  },
  fields: [
    {
      name: "origin",
      type: "string",
      title: "Origin",
      readOnly: true,
      hidden: true,
    },
    {
      name: "eventId",
      type: "string",
      title: "Event ID",
      readOnly: true,
    },
    {
      name: "name",
      type: "string",
      title: "Event name",
      readOnly: true,
    },
    {
      name: "start",
      type: "date",
      title: "Start date",
      readOnly: true,
    },
    {
      name: "end",
      type: "date",
      title: "End date",
      readOnly: true,
    },
    {
      name: "url",
      type: "url",
      title: "Event URL",
      readOnly: true,
    },
    {
      name: "venueName",
      type: "string",
      title: "Venue name",
      readOnly: true,
    },
    {
      name: "venueCity",
      type: "string",
      title: "Venue city",
      readOnly: true,
    },
    {
      name: "venueRegion",
      type: "string",
      title: "Venue state",
      readOnly: true,
    },
    {
      name: "latitude",
      type: "number",
      title: "Latitude",
      readOnly: true,
    },
    {
      name: "longitude",
      type: "number",
      title: "Longitude",
      readOnly: true,
    },
    {
      name: "imageUrl",
      type: "url",
      title: "Event image",
      readOnly: true,
    },
    {
      name: "organizationId",
      type: "string",
      title: "Organization ID",
      readOnly: true,
      hidden: true,
    },
    {
      name: "sanityEventId",
      type: "string",
      title: "Sanity Event ID",
      readOnly: true,
      hidden: true,
    },
    {
      name: "eventType",
      type: "string",
      title: "Event type",
      readOnly: true,
      hidden: true,
    },
    {
      name: "registrationStart",
      type: "datetime",
      title: "Registration start",
      readOnly: true,
      hidden: true,
    },
    {
      name: "registrationEnd",
      type: "datetime",
      title: "Registration end",
      readOnly: true,
      hidden: true,
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "start",
    },
  },
};
