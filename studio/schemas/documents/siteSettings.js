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
