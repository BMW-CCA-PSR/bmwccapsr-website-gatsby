// sanity.config.js
import React from "react";
import "./variableOverrides.css";
import { defineConfig } from "sanity";
import { deskTool } from 'sanity/desk'
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { contentGraphView } from "sanity-plugin-graph-view";
import {media} from 'sanity-plugin-media'
import schemas from "./schemas/schema";
import deskStructure from "./deskStructure";
import { SyncWithMsrAction } from "./src/documentActions/msrSyncAction";
import { ApplyMsrSourceSettingsAction } from "./src/documentActions/msrSourceSettingsAction";
import { AuthorPublishWithDefaultAvatarAction } from "./src/documentActions/authorPublishWithDefaultAvatarAction";
import { PostPublishFeaturedSingletonAction } from "./src/documentActions/postPublishFeaturedSingletonAction";
import { UpdateEmailAliasAction } from "./src/documentActions/emailAliasUpdateAction";
import { DeleteEmailAliasAction } from "./src/documentActions/emailAliasDeleteAction";

const vars = {
  apiId:
    process.env.SANITY_STUDIO_NETLIFY_API_ID ||
    process.env.VITE_NETLIFY_API_ID,
  buildHookId:
    process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK_ID ||
    process.env.VITE_NETLIFY_BUILD_HOOK_ID
};

const graphExcludedDocumentTypes = [
  "workflow.metadata",
  "sourceSettings",
  "volunteerApplication",
  "emailAlias",
  "emailAliasType",
  "emailSendingSettings",
];

const volunteerSingletonPageSettingsTypes = new Set([
  "volunteerOverviewPageSettings",
  "volunteerRewardsPageSettings",
  "volunteerRolesPageSettings",
  "volunteerApplicationLifecycleSettings",
]);

const singletonPageDocumentIds = new Set([
  "frontpage",
  "join",
]);

const graphViewQuery = `*[
  !(_id in path("drafts.**")) &&
  !(_id in path("_.*")) &&
  !(_type match "system.*") &&
  !(_type match "sanity.*") &&
  !(_type in ${JSON.stringify(graphExcludedDocumentTypes)})
]{
  ...,
  "title": coalesce(title, name, applicantName, documentId, slug.current, _id)
}`;

const StudioIcon = () =>
  React.createElement(
    "svg",
    { width: "1em", height: "1em", viewBox: "0 0 24 24", "aria-hidden": "true" },
    React.createElement("rect", {
      x: "1",
      y: "1",
      width: "22",
      height: "22",
      rx: "4",
      fill: "#ffffff",
      stroke: "#e5e7eb",
      strokeWidth: "1"
    }),
    React.createElement("rect", {
      x: "6",
      y: "6",
      width: "5",
      height: "5",
      fill: "#1e94ff"
    }),
    React.createElement("rect", {
      x: "13",
      y: "13",
      width: "5",
      height: "5",
      fill: "#1e94ff"
    })
  );

const isSameAction = (action, targetAction) =>
  action === targetAction || action?.name === targetAction?.name;

const isPublishAction = (action) =>
  action === "publish" ||
  action?.name === "publish" ||
  action?.action === "publish";

const isScheduledPublishAction = (action) => {
  const candidates = [
    action?.name,
    action?.displayName,
    action?.action,
    action?.title,
  ]
    .filter((value) => typeof value === "string")
    .map((value) => value.toLowerCase());

  return candidates.some(
    (value) =>
      value.includes("schedule") && value.includes("publish")
  );
};

const isScheduleRelatedAction = (action) => {
  const candidates = [
    action?.name,
    action?.displayName,
    action?.action,
    action?.title,
  ]
    .filter((value) => typeof value === "string")
    .map((value) => value.toLowerCase());

  return candidates.some((value) => value.includes("schedule"));
};

const isDuplicateAction = (action) =>
  action === "duplicate" ||
  action?.name === "duplicate" ||
  action?.action === "duplicate";

const isDeleteAction = (action) =>
  action === "delete" ||
  action?.name === "delete" ||
  action?.action === "delete";

const normalizeSource = (value) => String(value || "").trim().toLowerCase();

const normalizeDocumentId = (value) =>
  String(value || "")
    .trim()
    .replace(/^drafts\./, "")
    .toLowerCase();

const isSingletonPageDocument = (props) => {
  const documentId = normalizeDocumentId(
    props?.draft?._id || props?.published?._id || props?.id || props?.documentId
  );

  return singletonPageDocumentIds.has(documentId);
};

const isMsrEventDocument = (props) => {
  const source = normalizeSource(props?.draft?.source || props?.published?.source);
  const documentId = normalizeDocumentId(
    props?.draft?._id || props?.published?._id || props?.id || props?.documentId
  );
  return source === "msr" || documentId.startsWith("event-msr-");
};

const wrapEventActionForMsr = (action) => {
  if (typeof action !== "function") return action;

  const hideForMsr =
    isScheduledPublishAction(action) ||
    isDuplicateAction(action);

  if (!hideForMsr) return action;

  const WrappedAction = (props) => {
    const result = action(props);
    if (isMsrEventDocument(props)) return null;
    return result;
  };

  WrappedAction.displayName = `MsrAware${action.displayName || action.name || "Action"}`;
  return WrappedAction;
};

const orderEventActions = (previousActions = []) => {
  const withoutSync = previousActions.filter(
    (action) => !isSameAction(action, SyncWithMsrAction)
  );
  return [SyncWithMsrAction, ...withoutSync];
};

const wrapDefaultDeleteActionForEmailAlias = (action) => {
  if (typeof action !== "function") return action;
  if (!isDeleteAction(action)) return action;

  const WrappedAction = (props) => {
    const result = action(props);
    if (props?.published?._id) return null;
    return result;
  };

  WrappedAction.displayName = `EmailAliasDefault${action.displayName || action.name || "DeleteAction"}`;
  WrappedAction.action = action.action;
  return WrappedAction;
};

const wrapSingletonPageAction = (action) => {
  if (typeof action !== "function") return action;

  const shouldHideAction =
    isDuplicateAction(action) ||
    isDeleteAction(action) ||
    isScheduleRelatedAction(action);

  if (!shouldHideAction) return action;

  const WrappedAction = (props) => {
    const result = action(props);
    if (isSingletonPageDocument(props)) return null;
    return result;
  };

  WrappedAction.displayName = `SingletonPage${action.displayName || action.name || "Action"}`;
  WrappedAction.action = action.action;
  return WrappedAction;
};

export default defineConfig({
  title: "BMW CCA PSR Website",
  icon: StudioIcon,
  projectId: "clgsgxc0",
  dataset: "production",
  document: {
    actions: (previousActions, context) => {
      const schemaTypeName =
        typeof context?.schemaType === "string"
          ? context.schemaType
          : context?.schemaType?.name;
      if (schemaTypeName === "sourceSettings") {
        const withoutApply = previousActions.filter((action) => {
          if (action === ApplyMsrSourceSettingsAction) return false;
          if (isPublishAction(action)) return false;
          if (isScheduledPublishAction(action)) return false;
          if (isDeleteAction(action)) return false;
          if (isDuplicateAction(action)) return false;
          return true;
        });
        return [ApplyMsrSourceSettingsAction, ...withoutApply];
      }
      if (schemaTypeName === "siteSettings") {
        return previousActions.filter(
          (action) => !isDeleteAction(action) && !isDuplicateAction(action)
        );
      }
      if (schemaTypeName === "author") {
        const withoutPublish = previousActions.filter((action) => !isPublishAction(action));
        return [AuthorPublishWithDefaultAvatarAction, ...withoutPublish];
      }
      if (schemaTypeName === "emailAlias") {
        const customActions = previousActions.filter((action) => {
          if (action === UpdateEmailAliasAction) return false;
          if (action === DeleteEmailAliasAction) return false;
          if (isPublishAction(action)) return false;
          if (isScheduledPublishAction(action)) return false;
          return true;
        });
        return [
          UpdateEmailAliasAction,
          ...customActions.map(wrapDefaultDeleteActionForEmailAlias),
          DeleteEmailAliasAction,
        ];
      }
      if (schemaTypeName === "post") {
        const withoutPublish = previousActions.filter((action) => !isPublishAction(action));
        return [PostPublishFeaturedSingletonAction, ...withoutPublish];
      }
      if (schemaTypeName === "page") {
        return previousActions.map(wrapSingletonPageAction);
      }
      if (volunteerSingletonPageSettingsTypes.has(schemaTypeName)) {
        return previousActions.filter(
          (action) => !isDuplicateAction(action) && !isDeleteAction(action)
        );
      }
      if (schemaTypeName !== "event") return previousActions;
      return orderEventActions(previousActions.map(wrapEventActionForMsr));
    },
  },
  plugins: [
    deskTool({
      structure: deskStructure,
    }),
    contentGraphView({
      query: graphViewQuery,
    }),
    unsplashImageAsset(),
    media(),
  ].filter(Boolean),
  schema: {
    types: schemas,
  },
});
