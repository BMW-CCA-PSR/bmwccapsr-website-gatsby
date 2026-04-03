import { buildUniqueFieldValidator } from "../utils/uniqueFieldValidation";
import { MdAlternateEmail } from "react-icons/md";

const aliasPattern = /^[a-z0-9][a-z0-9._+-]*$/;
const normalizeValue = (value) => String(value || "").trim().toLowerCase();

export default {
  name: "emailAlias",
  type: "document",
  title: "Email Alias",
  icon: MdAlternateEmail,
  fields: [
    {
      name: "name",
      type: "string",
      title: "Alias Name",
      description:
        "Local-part only, without the @domain. Example: treasurer",
      validation: (Rule) =>
        Rule.required()
          .custom((value) => {
            const normalized = normalizeValue(value);
            if (!normalized) return true;
            if (normalized.includes("@")) {
              return "Enter the alias name only, without the @domain.";
            }
            if (!aliasPattern.test(normalized)) {
              return "Use lowercase letters, numbers, dots, dashes, underscores, or plus signs.";
            }
            return true;
          })
          .custom(
            buildUniqueFieldValidator({
              typeName: "emailAlias",
              fieldPath: "name",
              label: "Alias name",
            }),
          ),
    },
    {
      name: "enabled",
      type: "boolean",
      title: "Active",
      description:
        "Inactive preserves alias definition, but stops it from receiving mail.",
      initialValue: true,
    },
    {
      name: "recipients",
      type: "array",
      title: "Forward To",
      description:
        "Email addresses or existing aliases that should receive mail sent to this alias.",
      of: [
        {
          type: "emailAliasAddressRecipient",
        },
        {
          type: "emailAliasReferenceRecipient",
        },
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .custom((value, context) => {
            const entries = Array.isArray(value) ? value : [];
            const emailValues = [];
            const aliasRefs = [];

            for (const entry of entries) {
              const entryType = String(entry?._type || "").trim();

              if (entryType === "emailAliasAddressRecipient") {
                const normalized = normalizeValue(entry?.email);
                if (normalized) emailValues.push(normalized);
                continue;
              }

              if (entryType === "emailAliasReferenceRecipient" && entry?.alias?._ref) {
                aliasRefs.push(
                  String(entry.alias._ref || "").trim().replace(/^drafts\./, ""),
                );
              }
            }

            if (emailValues.length !== new Set(emailValues).size) {
              return "Email addresses must be unique.";
            }

            if (aliasRefs.length !== new Set(aliasRefs).size) {
              return "Alias references must be unique.";
            }

            const documentId = String(context?.document?._id || "")
              .trim()
              .replace(/^drafts\./, "");
            if (documentId && aliasRefs.includes(documentId)) {
              return "An alias cannot forward to itself.";
            }

            return true;
          }),
    },
    {
      name: "type",
      type: "reference",
      title: "Type",
      description: "Classifies this alias for filtered Studio views.",
      to: [{ type: "emailAliasType" }],
      weak: true,
      options: {
        disableNew: true,
      },
    },
  ],
  preview: {
    select: {
      title: "name",
      recipients: "recipients",
      typeTitle: "type.title",
      enabled: "enabled",
    },
    prepare({ title, recipients, typeTitle, enabled }) {
      const count = Array.isArray(recipients) ? recipients.length : 0;
      const normalizedType = String(typeTitle || "").trim();
      const enabledLabel = enabled === false ? "inactive" : "active";

      return {
        title: title || "Untitled alias",
        subtitle: `${count} forwarding address${count === 1 ? "" : "es"} | ${enabledLabel}${normalizedType ? ` | ${normalizedType}` : ""}`,
      };
    },
  },
};
