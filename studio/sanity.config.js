// sanity.config.js
import React from "react";
import "./variableOverrides.css";
import { defineConfig } from "sanity";
import { deskTool } from 'sanity/desk'
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import {media} from 'sanity-plugin-media'
import schemas from "./schemas/schema";
import deskStructure from "./deskStructure";
import { SyncWithMsrAction } from "./src/documentActions/msrSyncAction";
import { ApplyMsrSourceSettingsAction } from "./src/documentActions/msrSourceSettingsAction";
import { AuthorPublishWithDefaultAvatarAction } from "./src/documentActions/authorPublishWithDefaultAvatarAction";
import { PostPublishFeaturedSingletonAction } from "./src/documentActions/postPublishFeaturedSingletonAction";

const vars = {
  apiId:
    process.env.SANITY_STUDIO_NETLIFY_API_ID ||
    process.env.VITE_NETLIFY_API_ID,
  buildHookId:
    process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK_ID ||
    process.env.VITE_NETLIFY_BUILD_HOOK_ID
};

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
    action,
    action?.name,
    action?.action,
    action?.title,
  ]
    .map((value) => String(value || "").toLowerCase())
    .filter(Boolean);

  return candidates.some(
    (value) =>
      value.includes("schedule") && value.includes("publish")
  );
};

const isDuplicateAction = (action) =>
  action === "duplicate" ||
  action?.name === "duplicate" ||
  action?.action === "duplicate";

const normalizeSource = (value) => String(value || "").trim().toLowerCase();

const normalizeDocumentId = (value) =>
  String(value || "")
    .trim()
    .replace(/^drafts\./, "")
    .toLowerCase();

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
    if (isMsrEventDocument(props)) return null;
    return action(props);
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
          return true;
        });
        return [ApplyMsrSourceSettingsAction, ...withoutApply];
      }
      if (schemaTypeName === "author") {
        const withoutPublish = previousActions.filter((action) => !isPublishAction(action));
        return [AuthorPublishWithDefaultAvatarAction, ...withoutPublish];
      }
      if (schemaTypeName === "post") {
        const withoutPublish = previousActions.filter((action) => !isPublishAction(action));
        return [PostPublishFeaturedSingletonAction, ...withoutPublish];
      }
      if (schemaTypeName !== "event") return previousActions;
      return orderEventActions(previousActions.map(wrapEventActionForMsr));
    },
  },
  plugins: [
    deskTool({
      structure: deskStructure,
    }),
    unsplashImageAsset(),
    media(),
  ].filter(Boolean),
  schema: {
    types: schemas,
  },
});
