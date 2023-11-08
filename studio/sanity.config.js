// sanity.config.js
import { defineConfig } from "sanity";
import { deskTool } from 'sanity/desk'
import { defaultDocumentNode } from "./src/components/previewIFrame";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { scheduledPublishing } from "@sanity/scheduled-publishing";
import { contentGraphView } from "sanity-plugin-graph-view";
import {media} from 'sanity-plugin-media'
import schemas from "./schemas/schema";
import deskStructure from "./deskStructure";

export default defineConfig({
  title: "BMW CCA PSR Website",
  projectId: "clgsgxc0",
  dataset: "production",
  plugins: [
    deskTool({
      defaultDocumentNode,
      structure: deskStructure,
    }),
    unsplashImageAsset(),
    //contentGraphView({}),
    //scheduledPublishing(),
    //media()
  ],
  schema: {
    types: schemas,
  },
});