import React from "react";
import { RiUserStarLine as VolunteerRoleIcon } from "react-icons/ri";
import RoleScopeInput from "../../src/components/RoleScopeInput";
import AssignmentCardinalityInput from "../../src/components/AssignmentCardinalityInput";
import PresentationIconInput from "../../src/components/PresentationIconInput";
import ColorSelector, {
  colorHexValidator,
} from "../../src/components/colorSelector";
import { VOLUNTEER_ICON_COMPONENTS } from "../../src/components/volunteerIconOptions";

export default {
  name: "volunteerFixedRole",
  type: "document",
  title: "Volunteer Role",
  icon: VolunteerRoleIcon,
  fields: [
    {
      name: "name",
      type: "string",
      title: "Name",
      validation: (Rule) => Rule.required().error("Add a role name."),
    },
    {
      name: "description",
      type: "text",
      title: "Description",
      rows: 3,
      validation: (Rule) =>
        Rule.required().error("Add a short role description."),
    },
    {
      name: "detail",
      type: "text",
      title: "Detail",
      rows: 5,
    },
    {
      name: "pointValue",
      type: "number",
      title: "Point value",
      options: {
        list: [
          { title: "1", value: 1 },
          { title: "2", value: 2 },
          { title: "3", value: 3 },
          { title: "4", value: 4 },
          { title: "5", value: 5 },
          { title: "10", value: 10 },
        ],
      },
      validation: (Rule) => Rule.required().error("Select a point value."),
    },
    {
      name: "roleScope",
      type: "string",
      title: "Scope",
      description:
        "Defines whether this role is tied to a specific event or part of an ongoing program.",
      components: {
        input: RoleScopeInput,
      },
      options: {
        list: [
          {
            title: "Event: role is tied to a specific event date/location.",
            value: "event",
          },
          {
            title:
              "Club: role is ongoing or recurring, not tied to one event.",
            value: "program",
          },
        ],
        layout: "radio",
      },
      initialValue: "program",
      validation: (Rule) => Rule.required().error("Select a role scope."),
    },
    {
      name: "assignmentCardinality",
      type: "string",
      title: "Assignment type",
      description:
        "Sets default assignee count behavior for positions created from this role.",
      components: {
        input: AssignmentCardinalityInput,
      },
      options: {
        list: [
          {
            title: "Single assignee",
            value: "singleton",
          },
          {
            title: "Multiple assignees",
            value: "multiple",
          },
        ],
        layout: "radio",
      },
      initialValue: "multiple",
      validation: (Rule) => Rule.required().error("Select an assignment type."),
    },
    {
      name: "icon",
      type: "string",
      title: "Icon",
      description:
        "Icon used across volunteer cards and position detail pages.",
      components: {
        input: PresentationIconInput,
      },
      initialValue: "users",
      validation: (Rule) => Rule.required().error("Select an icon."),
    },
    {
      name: "color",
      type: "string",
      title: "Color",
      components: {
        input: (props) =>
          React.createElement(ColorSelector, {
            ...props,
            withColorNames: false,
            withHexInput: true,
            withSectionGuide: true,
            guideLabel: "Card accent/background color used across volunteer UI.",
            dynamicPalette: true,
            dynamicPaletteSteps: 5,
            resetPrimaryColor: "#1E94FF",
            resetSecondaryColor: "#0653B6",
            list: [
              { title: "Blue 1", value: "#1e94ff" },
              { title: "Blue 2", value: "#197fdd" },
              { title: "Blue 3", value: "#146bba" },
              { title: "Blue 4", value: "#0f5898" },
              { title: "Blue 5", value: "#0b4779" },
              { title: "Black", value: "#000000" },
            ],
          }),
      },
      initialValue: "#1e94ff",
      validation: (Rule) => Rule.required().custom(colorHexValidator),
    },
  ],
  preview: {
    select: {
      title: "name",
      points: "pointValue",
      cardinality: "assignmentCardinality",
      icon: "icon",
      legacyIcon: "presentationIcon",
    },
    prepare({ title, points, cardinality, icon, legacyIcon }) {
      const pointLabel =
        points === undefined || points === null
          ? "No point value set"
          : `${points} point${points === 1 ? "" : "s"}`;
      const cardinalityLabel =
        cardinality === "singleton"
          ? "Single assignee"
          : cardinality === "multiple"
            ? "Multiple assignees"
            : null;
      const resolvedIcon = icon || legacyIcon;
      const IconComponent =
        VOLUNTEER_ICON_COMPONENTS[String(resolvedIcon || "").trim().toLowerCase()] ||
        VolunteerRoleIcon;
      return {
        title: title || "Untitled role",
        subtitle: [pointLabel, cardinalityLabel].filter(Boolean).join(" | "),
        media: IconComponent,
      };
    },
  },
};
