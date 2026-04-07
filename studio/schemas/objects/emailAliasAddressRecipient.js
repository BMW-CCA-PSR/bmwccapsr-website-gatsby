import { MdEmail } from "react-icons/md";

const normalizeValue = (value) => String(value || "").trim().toLowerCase();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  name: "emailAliasAddressRecipient",
  type: "object",
  title: "Email Address",
  icon: MdEmail,
  fields: [
    {
      name: "email",
      type: "string",
      title: "Email Address",
      validation: (Rule) =>
        Rule.required().custom((value) => {
          const normalized = normalizeValue(value);
          if (!normalized) return "Email address is required.";
          if (!emailPattern.test(normalized)) {
            return "Enter a valid email address.";
          }
          return true;
        }),
    },
  ],
  preview: {
    select: {
      title: "email",
    },
    prepare({ title }) {
      return {
        title: title || "Email address",
        media: MdEmail,
      };
    },
  },
};
