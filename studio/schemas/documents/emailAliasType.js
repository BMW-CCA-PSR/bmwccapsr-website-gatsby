import { MdLocalOffer } from "react-icons/md";
import { buildUniqueFieldValidator } from "../utils/uniqueFieldValidation";

const normalizeValue = (value) => String(value || "").trim();

export default {
  name: "emailAliasType",
  type: "document",
  title: "Alias Type",
  icon: MdLocalOffer,
  fields: [
    {
      name: "title",
      type: "string",
      title: "Type Name",
      description: "Used to classify aliases in Studio views.",
      validation: (Rule) =>
        Rule.required()
          .custom((value) => {
            if (!normalizeValue(value)) {
              return "Type name is required.";
            }

            return true;
          })
          .custom(
            buildUniqueFieldValidator({
              typeName: "emailAliasType",
              fieldPath: "title",
              label: "Type name",
            }),
          ),
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: normalizeValue(title) || "Untitled alias type",
      };
    },
  },
};
