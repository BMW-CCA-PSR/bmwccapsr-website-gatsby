import { MdAlternateEmail } from "react-icons/md";

export default {
  name: "emailAliasReferenceRecipient",
  type: "object",
  title: "Alias",
  icon: MdAlternateEmail,
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
      recipients: "alias.recipients",
      enabled: "alias.enabled",
      typeTitle: "alias.type.title",
    },
    prepare({ title, recipients, enabled, typeTitle }) {
      const normalizedType = String(typeTitle || "").trim();
      const count = Array.isArray(recipients) ? recipients.length : 0;
      return {
        title: title || "Alias reference",
        subtitle: [
          `${count} forwarding address${count === 1 ? "" : "es"}`,
          enabled === false ? "inactive" : "active",
          normalizedType || null,
        ]
          .filter(Boolean)
          .join(" | "),
        media: MdAlternateEmail,
      };
    },
  },
};
