import { isValidDomain, normalizeDomain } from "../../src/lib/emailAlias";

export default {
  name: "siteSettings",
  type: "document",
  title: "Site Settings",
  __experimental_actions: ["update", /*'create', 'delete', */ "publish"],
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
    },
    {
      name: "domain",
      type: "string",
      title: "Domain",
      description:
        "Domain only, without https://, paths, or email addresses. Example: example.com",
      validation: (Rule) =>
        Rule.required().custom((value) => {
          const rawValue = String(value || "").trim();
          const normalizedDomain = normalizeDomain(value);

          if (!rawValue) return "Domain is required.";
          if (rawValue.includes("@")) {
            return "Enter the domain only, not an email address.";
          }
          if (/^https?:\/\//i.test(rawValue) || rawValue.includes("/")) {
            return "Enter the domain only, without a protocol or path.";
          }
          if (!isValidDomain(normalizedDomain)) {
            return "Enter a valid domain like example.com.";
          }

          return true;
        }),
    },
    {
      name: "navMenu",
      type: "reference",
      title: "Navigation menu",
      weak: true, // Uncomment if you want to be able to delete navigation even though pages refer to it
      to: [{ type: "navigationMenu" }],
      description: "Which nav menu should be shown, if any",
    },
    {
      title: "Open graph",
      name: "openGraph",
      description:
        "These will be the default meta tags on all pages that have not set their own",
      type: "openGraph",
    },
    {
      name: "privacyPolicy",
      type: "bodyPortableText",
      title: "Privacy Policy",
      description: "Site-wide Privacy Policy content.",
    },
    {
      name: "termsOfUse",
      type: "bodyPortableText",
      title: "Terms of Use / Service",
      description: "Site-wide Terms of Use or Terms of Service content.",
    },
  ],
};
