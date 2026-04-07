import { GoGear as SettingsIcon } from "react-icons/go";

export default {
  name: "emailSendingSettings",
  type: "document",
  title: "Sending Settings",
  icon: SettingsIcon,
  __experimental_actions: ["update", "publish"],
  initialValue: {
    title: "Sending Settings",
    fromName: "BMW CCA PSR Volunteer Program",
    fromEmail: "no-reply@bmw-club-psr.org",
  },
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      hidden: true,
      readOnly: true,
      initialValue: "Sending Settings",
    },
    {
      name: "fromName",
      type: "string",
      title: "From Name",
      description: "Display name used on outgoing emails.",
    },
    {
      name: "fromEmail",
      type: "string",
      title: "From Email Address",
      description:
        "SES-verified sender address used for outbound mail. Example: no-reply@bmw-club-psr.org",
      validation: (Rule) =>
        Rule.required().email().error("Enter a valid sender email address."),
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: title || "Sending Settings",
        media: SettingsIcon,
      };
    },
  },
};
