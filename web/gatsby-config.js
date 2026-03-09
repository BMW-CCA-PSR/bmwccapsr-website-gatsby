const path = require("path");

// Load base `.env` first, then environment-specific overrides.
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});
require("dotenv").config({
  path: path.resolve(
    __dirname,
    `.env.${process.env.NODE_ENV || "development"}`,
  ),
});
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
    "gatsby-plugin-netlify",
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
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [
          "G-FHCNCPJEVP"
        ],
        pluginConfig: {
          head: true,
        },
      },
    },
  ],
};
