export default {
  name: "volunteerRolesPageSettings",
  type: "document",
  title: "Volunteer Roles Page Settings",
  __experimental_actions: ["update", "publish"],
  initialValue: {
    title: "Volunteer Roles Page Settings",
    subheader: [
      {
        _type: "block",
        style: "normal",
        children: [
          {
            _type: "span",
            marks: [],
            text:
              "Explore the official role lineup our Board has defined to power every PSR event. Use this catalog to compare responsibilities, skill level, and point value across roles.",
          },
        ],
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      hidden: true,
      readOnly: true,
      initialValue: "Volunteer Roles Page Settings",
    },
    {
      name: "subheader",
      type: "bodyPortableText",
      title: "Subheader",
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: title || "Volunteer Roles Page Settings",
      };
    },
  },
};
