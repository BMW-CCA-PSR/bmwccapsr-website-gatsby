// Load variables from `.env` as soon as possible
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`
});

const path = require("path");
const clientConfig = require("./client-config");

const isProd = process.env.NODE_ENV === "production";
const previewEnabled = (process.env.GATSBY_IS_PREVIEW || "false").toLowerCase() === "true"
module.exports = {
  siteMetadata: {
    siteUrl: "https://bmw-club-psr.org",
    title: "BMW CCA PSR Website",
  },
  plugins: [
    {
      resolve: "gatsby-plugin-theme-ui",
      options: {
        preset: require("./src/theme"),
      },
    },
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-mdx",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-plugin-gatsby-cloud",
    {
      resolve: "gatsby-source-sanity",
      options: {
        ...clientConfig.sanity,
        token: process.env.GATSBY_SANITY_TOKEN,
        watchMode: !isProd, // watchMode only in dev mode
        overlayDrafts: !isProd || previewEnabled, // drafts in dev & Gatsby Cloud Preview
      },
    },
    {
      resolve: "gatsby-plugin-sanity-image",
      options: {
        ...clientConfig.sanity,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },
  ],
};
