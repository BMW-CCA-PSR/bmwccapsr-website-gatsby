module.exports = {
  siteMetadata: {
    siteUrl: "https://www.yourdomain.tld",
    title: "BMW CCA PSR Website",
  },
  plugins: [
    {
      resolve: "gatsby-source-sanity",
      options: {
        projectId: "clgsgxc0",
        dataset: "beta",
      },
    },
    "gatsby-plugin-theme-ui",
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-mdx",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
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
