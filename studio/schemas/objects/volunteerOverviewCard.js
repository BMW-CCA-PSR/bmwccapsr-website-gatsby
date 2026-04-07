export default {
  name: "volunteerOverviewCard",
  type: "object",
  title: "Volunteer Overview Card",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "body",
      type: "bodyPortableText",
      title: "Body",
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: title || "Overview card",
      };
    },
  },
};
