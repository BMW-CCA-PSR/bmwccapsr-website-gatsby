module.exports = {
  sanity: {
    projectId: process.env.GATSBY_SANITY_PROJECT_ID || "clgsgxc0",
    dataset: process.env.GATSBY_SANITY_DATASET || "production",
    useCdn: false,
    apiVersion: "2021-08-31",
    // Keep auth tokens out of browser fetches. Public-read event queries should
    // run without Authorization headers to avoid silent CORS/auth failures.
    token:
      typeof window === "undefined"
        ? process.env.GATSBY_SANITY_TOKEN || undefined
        : undefined,
  },
};
