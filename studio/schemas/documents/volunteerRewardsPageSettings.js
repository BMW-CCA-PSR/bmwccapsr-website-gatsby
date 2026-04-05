export default {
  name: "volunteerRewardsPageSettings",
  type: "document",
  title: "Volunteer Rewards Page Settings",
  __experimental_actions: ["update", "publish"],
  initialValue: {
    title: "Volunteer Rewards Page Settings",
  },
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      hidden: true,
      readOnly: true,
      initialValue: "Volunteer Rewards Page Settings",
    },
    {
      name: "heroHighlights",
      type: "array",
      title: "Hero Highlights",
      description: 'Three short words or phrases shown as "Your X. Your Y. Your Z."',
      of: [{ type: "string" }],
      validation: (Rule) =>
        Rule.max(3).error("Hero Highlights supports up to 3 items."),
    },
    {
      name: "introBody",
      type: "bodyPortableText",
      title: "Intro Body",
    },
    {
      name: "howProgramWorksBody",
      type: "bodyPortableText",
      title: "How the Program Works Body",
    },
    {
      name: "pointLevels",
      type: "array",
      title: "Volunteer Point Levels",
      of: [{ type: "volunteerRewardLevel" }],
      validation: (Rule) =>
        Rule.max(4).error("Volunteer Point Levels supports up to 4 cards."),
    },
    {
      name: "pointLevelsFootnote",
      type: "text",
      title: "Point Levels Footnote",
      rows: 3,
    },
    {
      name: "eligibilityBody",
      type: "bodyPortableText",
      title: "Eligibility and Requirements Body",
    },
    {
      name: "faqIntro",
      type: "text",
      title: "FAQ Intro",
      rows: 3,
    },
    {
      name: "faqs",
      type: "array",
      title: "FAQs",
      of: [{ type: "volunteerRewardFaq" }],
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: title || "Volunteer Rewards Page Settings",
      };
    },
  },
};
