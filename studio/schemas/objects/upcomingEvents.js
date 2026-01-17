export default {
  type: "object",
  name: "upcomingEvents",
  title: "upcoming-events",
  fields: [
    {
      type: "string",
      name: "title",
      initialValue: "Upcoming Events"
    },
    {
      type: "number",
      name: "limit",
      initialValue: 2,
      options: {
        list: [2, 3, 4]
      }
    }
  ],
  preview: {
    select: {
      title: "title",
      limit: "limit"
    },
    prepare({ title, limit }) {
      return {
        title: title || "Upcoming Events",
        subtitle: `Limit: ${limit || 2}`
      };
    }
  }
};
