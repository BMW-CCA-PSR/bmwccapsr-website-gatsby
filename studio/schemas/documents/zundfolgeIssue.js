import ZundfolgeIssuePublishYearInput from "../../src/components/ZundfolgeIssuePublishYearInput";
import {
  buildIssueTitle,
  getIssueMonthSortValue,
  isValidIssueMonthInput,
} from "../../src/lib/zundfolgeIssueTitle";

export default {
  name: "zundfolgeIssue",
  type: "document",
  title: "Zundfolge Issue",
  fieldsets: [
    {
      name: "publishDate",
      title: "Publish Date",
      options: { collapsible: false },
    },
  ],
  initialValue: () => {
    const now = new Date();
    return {
      publishMonth: String(now.getUTCMonth() + 1),
      publishMonthSort: now.getUTCMonth() + 1,
      publishYear: now.getUTCFullYear(),
    };
  },
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      hidden: true,
      readOnly: true,
    },
    {
      name: "publishMonth",
      type: "string",
      title: "Month",
      description:
        "Enter one month number like 5, or two month numbers like 4 5 or 12 1.",
      fieldset: "publishDate",
      validation: (Rule) =>
        Rule.required().custom((value) =>
          isValidIssueMonthInput(value)
            ? true
            : "Enter one or two month numbers between 1 and 12, for example 5, 4 5, or 12 1.",
        ),
    },
    {
      name: "publishMonthSort",
      type: "number",
      title: "Publish Month Sort",
      hidden: true,
      readOnly: true,
    },
    {
      name: "publishYear",
      type: "number",
      title: "Year",
      description: "Enter the numeric year, for example 1989.",
      fieldset: "publishDate",
      components: {
        input: ZundfolgeIssuePublishYearInput,
      },
      validation: (Rule) => Rule.required().integer().min(1900).max(2100),
    },
  ],
  orderings: [
    {
      name: "publishDateDesc",
      title: "Publish date newest to oldest",
      by: [
        { field: "publishYear", direction: "desc" },
        { field: "publishMonthSort", direction: "desc" },
      ],
    },
    {
      name: "publishDateAsc",
      title: "Publish date oldest to newest",
      by: [
        { field: "publishYear", direction: "asc" },
        { field: "publishMonthSort", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      publishMonth: "publishMonth",
      publishYear: "publishYear",
    },
    prepare({ title, publishMonth, publishYear }) {
      const computedTitle =
        String(title || "").trim() || buildIssueTitle(publishMonth, publishYear);

      return {
        title: computedTitle || "Untitled Issue",
        subtitle:
          (computedTitle || (publishMonth && publishYear))
            ? "Zundfolge archive issue"
            : "Missing publish month or year",
      };
    },
  },
};