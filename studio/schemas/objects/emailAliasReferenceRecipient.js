import { MdForward } from "react-icons/md";

export default {
  name: "emailAliasReferenceRecipient",
  type: "object",
  title: "Alias",
  icon: MdForward,
  fields: [
    {
      name: "alias",
      type: "reference",
      title: "Alias",
      weak: true,
      to: [{ type: "emailAlias" }],
      options: {
        disableNew: true,
      },
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: "alias.name",
    },
    prepare({ title }) {
      return {
        title: title || "Alias reference",
      };
    },
  },
};
