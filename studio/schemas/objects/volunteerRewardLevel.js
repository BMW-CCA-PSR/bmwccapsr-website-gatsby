export default {
  name: "volunteerRewardLevel",
  type: "object",
  title: "Volunteer Reward Level",
  fields: [
    {
      name: "points",
      type: "string",
      title: "Points",
      description: "Displayed large on the left, for example 1-2, 3-4, 5, or 10.",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "heading",
      type: "string",
      title: "Heading",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "lead",
      type: "string",
      title: "Lead Text",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "bullets",
      type: "array",
      title: "Bullets",
      of: [{ type: "string" }],
    },
  ],
  preview: {
    select: {
      title: "heading",
      subtitle: "points",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Reward level",
        subtitle: subtitle ? `${subtitle} points` : "",
      };
    },
  },
};
