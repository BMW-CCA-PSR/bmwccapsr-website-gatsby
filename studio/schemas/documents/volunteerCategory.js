import { MdLocalOffer as VolunteerCategoryIcon } from "react-icons/md";

const SANITY_API_VERSION = "2024-06-01";

const getComparableDocumentIds = (documentId) => {
  const normalizedId = String(documentId || "").trim();
  if (!normalizedId) return [];
  const publishedId = normalizedId.replace(/^drafts\./, "");
  const draftId = publishedId ? `drafts.${publishedId}` : "";
  return Array.from(new Set([normalizedId, publishedId, draftId].filter(Boolean)));
};

export default {
  name: "volunteerCategory",
  type: "document",
  title: "Volunteer Category",
  icon: VolunteerCategoryIcon,
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      validation: (Rule) =>
        Rule.required()
          .error("Add a category title.")
          .custom(async (value, context) => {
            const normalizedTitle = String(value || "").trim().toLowerCase();
            if (!normalizedTitle) return true;

            const client = context.getClient({ apiVersion: SANITY_API_VERSION });
            const comparableIds = getComparableDocumentIds(context.document?._id);
            const categoryCount = await client.fetch(
              `count(*[_type == "volunteerCategory" && !(_id in $comparableIds)])`,
              { comparableIds },
            );

            if (Number(categoryCount) >= 5 && comparableIds.length === 0) {
              return "Volunteer categories are limited to 5.";
            }

            const duplicateCount = await client.fetch(
              `count(*[
                _type == "volunteerCategory" &&
                lower(title) == $normalizedTitle &&
                !(_id in $comparableIds)
              ])`,
              { normalizedTitle, comparableIds },
            );

            return Number(duplicateCount) > 0
              ? "Volunteer categories must be unique."
              : true;
          }),
    },
    {
      name: "description",
      type: "text",
      title: "Description",
      rows: 3,
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Untitled category",
        subtitle: subtitle || "Volunteer category",
        media: VolunteerCategoryIcon,
      };
    },
  },
};
