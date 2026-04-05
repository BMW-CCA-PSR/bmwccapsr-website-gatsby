export default {
  name: "volunteerOverviewPageSettings",
  type: "document",
  title: "Volunteer Overview Page Settings",
  __experimental_actions: ["update", "publish"],
  initialValue: {
    title: "Volunteer Overview Page Settings",
  },
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      hidden: true,
      readOnly: true,
      initialValue: "Volunteer Overview Page Settings",
    },
    {
      name: "subheader",
      type: "bodyPortableText",
      title: "Subheader",
      description: "Intro copy shown below the Volunteer Overview page title.",
    },
    {
      name: "overviewImage",
      type: "mainImage",
      title: "Overview Image",
      description: "Image shown on the right side of the Volunteer Overview page header.",
    },
    {
      name: "gettingStartedCards",
      type: "array",
      title: "Getting Started Cards",
      of: [{ type: "volunteerOverviewCard" }],
      validation: (Rule) =>
        Rule.max(4).error("Getting Started supports up to 4 cards."),
    },
    {
      name: "skillLevelCards",
      type: "array",
      title: "Skill Level Guide Cards",
      of: [{ type: "volunteerOverviewCard" }],
      validation: (Rule) =>
        Rule.max(3).error("Skill Level Guide supports up to 3 cards."),
    },
    {
      name: "roleScopeBody",
      type: "bodyPortableText",
      title: "Role Scope Body",
      description: "Intro copy shown above the Event-Based and Club-Based role cards.",
    },
    {
      name: "roleScopeCards",
      type: "array",
      title: "Role Scope Cards",
      of: [{ type: "volunteerOverviewCard" }],
      validation: (Rule) =>
        Rule.max(2).error("Role Scope supports up to 2 cards."),
    },
    {
      name: "whyVolunteerBody",
      type: "bodyPortableText",
      title: "Why Volunteer Body",
      description: "Portable text body for the Why Volunteer section.",
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: title || "Volunteer Overview Page Settings",
      };
    },
  },
};
