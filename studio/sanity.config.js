// sanity.config.js
import React from "react";
import { defineConfig } from "sanity";
import { deskTool } from 'sanity/desk'
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import {media} from 'sanity-plugin-media'
import schemas from "./schemas/schema";
import deskStructure from "./deskStructure";
import { netlifyWidget } from "sanity-plugin-dashboard-widget-netlify";

const vars = {
  apiId:
    (import.meta && import.meta.env && import.meta.env.VITE_NETLIFY_API_ID) ||
    process.env.SANITY_STUDIO_NETLIFY_API_ID,
  buildHookId:
    (import.meta && import.meta.env && import.meta.env.VITE_NETLIFY_BUILD_HOOK_ID) ||
    process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK_ID
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

export default defineConfig({
  title: "BMW CCA PSR Website",
  icon: StudioIcon,
  projectId: "clgsgxc0",
  dataset: "production",
  plugins: [
    deskTool({
      structure: deskStructure,
    }),
    unsplashImageAsset(),
    media(),
    vars.apiId && vars.buildHookId
      ? netlifyWidget({
          title: 'My Netlify deploys',
          sites: [
            {
              title: 'Sanity Studio',
              apiId: vars.apiId,
              buildHookId: vars.buildHookId,
              name: 'bmw-club-psr',
              url: 'https://bmw-club-psr.org'
            },
          ]
        })
      : null
  ].filter(Boolean),
  schema: {
    types: schemas,
  },
});
