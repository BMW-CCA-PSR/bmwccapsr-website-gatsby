import { RiUserStarLine as VolunteerRoleIcon } from "react-icons/ri";
import AutoSlugInput from "../../src/components/AutoSlugInput";
import AutoSkillLevelInput from "../../src/components/AutoSkillLevelInput";
import { VOLUNTEER_ICON_COMPONENTS } from "../../src/components/volunteerIconOptions";

const SANITY_API_VERSION = "2021-08-31";

const getRelatedDocumentIds = (documentId) => {
  const normalizedId = String(documentId || "").trim();
  if (!normalizedId) return [];
  const publishedId = normalizedId.replace(/^drafts\./, "");
  const draftId = publishedId ? `drafts.${publishedId}` : "";
  return Array.from(
    new Set([normalizedId, publishedId, draftId].filter(Boolean))
  );
};

export default {
  name: "volunteerRole",
  type: "document",
  title: "Volunteer Position",
  fieldsets: [
    {
      name: "positionToggles",
      title: "Position settings",
    },
  ],
  fields: [
    {
      name: "role",
      type: "reference",
      to: {
        type: "volunteerFixedRole",
      },
      title: "Role",
      options: {
        filter: async ({ document, getClient }) => {
          const client = getClient({ apiVersion: SANITY_API_VERSION });
          const excludedIds = getRelatedDocumentIds(document?._id);
          const currentRoleId = String(document?.role?._ref || "").trim();
          const blockedRoleIdsRaw = await client.fetch(
            `*[
              _type == "volunteerRole" &&
              !(_id in $excludedIds) &&
              role->roleScope == "program" &&
              role->assignmentCardinality == "singleton" &&
              defined(role._ref)
            ].role._ref`,
            { excludedIds }
          );
          const blockedRoleIds = Array.from(
            new Set(
              Array.isArray(blockedRoleIdsRaw)
                ? blockedRoleIdsRaw
                    .map((value) => String(value || "").trim())
                    .filter(Boolean)
                : []
            )
          );

          if (blockedRoleIds.length === 0) {
            return {};
          }

          return {
            filter:
              "!(_id in $blockedRoleIds) || (_id == $currentRoleId && defined($currentRoleId) && $currentRoleId != '')",
            params: {
              blockedRoleIds,
              currentRoleId,
            },
          };
        },
      },
      validation: (Rule) =>
        Rule.error("Select a role.")
          .required()
          .custom(async (value, context) => {
            const roleId = String(value?._ref || "").trim();
            if (!roleId) return true;

            const client = context.getClient({
              apiVersion: SANITY_API_VERSION,
            });
            const roleConfig = await client.fetch(
              `*[_type == "volunteerFixedRole" && _id == $roleId][0]{
                roleScope,
                assignmentCardinality,
                name
              }`,
              { roleId }
            );

            const isProgramSingleton =
              String(roleConfig?.roleScope || "")
                .trim()
                .toLowerCase() === "program" &&
              String(roleConfig?.assignmentCardinality || "")
                .trim()
                .toLowerCase() === "singleton";

            if (!isProgramSingleton) return true;

            const excludedIds = getRelatedDocumentIds(context.document?._id);
            const duplicateCount = await client.fetch(
              `count(*[
                _type == "volunteerRole" &&
                role._ref == $roleId &&
                !(_id in $excludedIds)
              ])`,
              { roleId, excludedIds }
            );

            if (Number(duplicateCount) > 0) {
              return `${
                roleConfig?.name || "This role"
              } is configured as a club-scope single-assignee role, so only one volunteer position may exist for it at a time.`;
            }

            return true;
          }),
    },
    {
      name: "slug",
      type: "slug",
      title: "Slug",
      description:
        'Auto-generated from position name + event date when event is selected; otherwise position name + current date. (e.g. "/volunteer/hpde-assistant-2026-04-18")',
      components: {
        input: AutoSlugInput,
      },
      options: {
        maxLength: 96,
        source: "role",
      },
      validation: (Rule) =>
        Rule.error("Add a slug to publish this position.").required(),
    },
    {
      title: "Active position",
      name: "active",
      type: "boolean",
      initialValue: true,
      fieldset: "positionToggles",
    },
    {
      name: "membershipRequired",
      type: "boolean",
      title: "BMW CCA Membership Required",
      initialValue: false,
      fieldset: "positionToggles",
      validation: (Rule) =>
        Rule.required().custom((value) =>
          value === true || value === false ? true : "Select Yes or No."
        ),
    },
    {
      name: "motorsportRegEvent",
      type: "motorsportRegEvent",
      title: "Event",
      description:
        "Select an MSR or Sanity event for this position (optional).",
    },
    {
      name: "descriptionPdf",
      type: "file",
      title: "Description PDF (optional)",
      options: {
        accept: ".pdf",
      },
    },
    {
      name: "date",
      type: "date",
      title: "Date",
    },
    {
      name: "duration",
      type: "number",
      title: "Duration",
      description: "Hours (numbers only)",
      validation: (Rule) =>
        Rule.optional().custom((value) =>
          value === undefined || value === null || value >= 0
            ? true
            : "Provide a duration in hours (numbers only)."
        ),
    },
    {
      name: "capacity",
      type: "number",
      title: "Capacity",
      description:
        "Optional override for assignment limit. Leave empty or 0 to use role defaults (single-assignee roles default to 1; multiple-assignee roles default to unlimited).",
      validation: (Rule) =>
        Rule.optional()
          .integer()
          .min(0)
          .error("Capacity must be a whole number that is 0 or greater."),
    },
    {
      name: "assignedVolunteers",
      type: "array",
      title: "Assigned volunteers",
      description:
        "Auto-managed from application assignment actions. This list is read-only.",
      of: [
        {
          type: "reference",
          to: [{ type: "volunteerApplication" }],
        },
      ],
      readOnly: true,
    },
    {
      name: "compensation",
      type: "string",
      title: "Compensation / swag item",
      validation: (Rule) => Rule.optional(),
    },
    {
      name: "skillLevel",
      type: "string",
      title: "Skill level",
      description:
        "Auto-populated from role point value (1-2 Entry, 3-4 Intermediate, 5/10 Advanced). You can override if needed.",
      components: {
        input: AutoSkillLevelInput,
      },
      options: {
        list: [
          { title: "Entry", value: "entry" },
          { title: "Intermediate", value: "medium" },
          { title: "Advanced", value: "high" },
        ],
      },
      validation: (Rule) => Rule.required().error("Select a skill level."),
    },
  ],
  preview: {
    select: {
      roleName: "role.name",
      roleIcon: "role.icon",
      roleLegacyIcon: "role.presentationIcon",
      eventName: "motorsportRegEvent.name",
      date: "date",
      points: "role.pointValue",
    },
    prepare({ roleName, roleIcon, roleLegacyIcon, eventName, date, points }) {
      const title = roleName || "Untitled position";
      const subtitleParts = [eventName];
      if (date) subtitleParts.push(date);
      if (points !== undefined && points !== null) {
        subtitleParts.push(`${points} pts`);
      }
      const subtitle = subtitleParts.filter(Boolean).join(" | ");
      const resolvedIcon = roleIcon || roleLegacyIcon;
      const IconComponent =
        VOLUNTEER_ICON_COMPONENTS[
          String(resolvedIcon || "")
            .trim()
            .toLowerCase()
        ] || VolunteerRoleIcon;
      return {
        title,
        subtitle,
        media: IconComponent,
      };
    },
  },
};
