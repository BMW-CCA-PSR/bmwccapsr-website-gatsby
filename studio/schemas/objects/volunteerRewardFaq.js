import { MdHelpOutline } from "react-icons/md";

export default {
  name: "volunteerRewardFaq",
  type: "object",
  title: "Volunteer Reward FAQ",
  icon: MdHelpOutline,
  fields: [
    {
      name: "question",
      type: "string",
      title: "Question",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "answer",
      type: "bodyPortableText",
      title: "Answer",
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: "question",
    },
    prepare({ title }) {
      return {
        title: title || "FAQ item",
        media: MdHelpOutline,
      };
    },
  },
};
