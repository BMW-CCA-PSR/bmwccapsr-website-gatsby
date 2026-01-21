export default {
  type: "object",
  name: "zundfolgeLatest",
  title: "zundfolge-latest",
  fields: [
    {
      type: "string",
      name: "title",
      hidden: true,
      initialValue: "Zundfolge"
    }
  ],
  preview: {
    select: {
      title: "title"
    },
    prepare({ title }) {
      return {
        title: title || "Zundfolge"
      };
    }
  }
};
