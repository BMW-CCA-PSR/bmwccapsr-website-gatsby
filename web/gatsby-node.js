const { isFuture, parseISO } = require("date-fns");
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const normalizeVolunteerPath = (slugValue, pathPrefix = "/volunteer") => {
  const trimmed = String(slugValue || "").trim();
  if (!trimmed) return pathPrefix;
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (withSlash === pathPrefix || withSlash.startsWith(`${pathPrefix}/`)) {
    return withSlash.replace(/\/+$/, "");
  }
  return `${pathPrefix}${withSlash}`.replace(/\/+$/, "");
};

const buildVolunteerFallbackPath = (id, pathPrefix = "/volunteer") => {
  const safeId = String(id || "position")
    .replace(/^drafts\./, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${pathPrefix}/${safeId || "position"}`;
};

exports.createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes(`
    extend type SanityVolunteerRole {
      skillLevel: String
      membershipRequired: Boolean
    }
  `);
  actions.createTypes([
    schema.buildObjectType({
      name: "SanityJoinHero",
      fields: {
        label: { type: "String" },
        heading: { type: "String" },
        subheading: { type: "String" },
      },
    }),
    schema.buildObjectType({
      name: "SanityJoinEventItem",
      fields: {
        title: { type: "String" },
        details: { type: "String" },
      },
    }),
    schema.buildObjectType({
      name: "SanityJoinEventSection",
      fields: {
        heading: { type: "String" },
        subheading: { type: "JSON" },
        subtext: { type: "String" },
        columns: { type: "Int" },
        items: { type: "[SanityJoinEventItem]" },
      },
    }),
    schema.buildObjectType({
      name: "SanityJoinBenefitItem",
      fields: {
        title: { type: "String" },
        description: { type: "String" },
      },
    }),
    schema.buildObjectType({
      name: "SanityPage",
      interfaces: ["Node"],
      fields: {
        joinHero: { type: "SanityJoinHero" },
        joinHpdeSection: { type: "SanityJoinEventSection" },
        joinSocialSection: { type: "SanityJoinEventSection" },
        joinBenefitsPrimary: { type: "[SanityJoinBenefitItem]" },
        joinBenefitsSecondary: { type: "[SanityJoinBenefitItem]" },
        joinEventHighlightsIntro: { type: "String" },
        joinBenefitsIntro: { type: "String" },
      },
    }),
    schema.buildObjectType({
      name: "SanityPost",
      interfaces: ["Node"],
      fields: {
        isPublished: {
          type: "Boolean!",
          resolve: (source) => new Date(source.publishedAt) <= new Date(),
        },
        featured: {
          type: "Boolean",
        },
        relatedPosts: {
          type: "[SanityPost]",
          resolve: async (source, args, context, info) => {
            const category = source._rawDataCategory
              ? source._rawDataCategory._ref
              : null;
            if (!category) return [];

            const { entries } = await context.nodeModel.findAll({
              type: "SanityPost",
              query: {
                sort: {
                  fields: ["publishedAt"],
                  order: ["DESC"],
                },
              }
            })
            const now = new Date();
            const posts = entries.filter((post) => {
              if (!post || !post._rawDataCategory || post._id === source._id) {
                return false;
              }
              if (post._rawDataCategory._ref !== category) {
                return false;
              }
              if (!post.slug || !post.slug.current) {
                return false;
              }
              if (!post.publishedAt) {
                return false;
              }
              const publishedAt = new Date(post.publishedAt);
              if (Number.isNaN(publishedAt.getTime())) {
                return false;
              }
              return publishedAt <= now;
            });
            return Array.from(posts)
          },
        },
      },
    }),
    schema.buildObjectType({
      name: "SanityEvent",
      interfaces: ["Node"],
      fields: {
        isActive: {
          type: "Boolean!",
          resolve: (source) => new Date(source.startTime) >= new Date(),
        },
        onlineEvent: {
          type: "Boolean",
        },
        onlineLink: {
          type: "String",
        },
      },
    }),
    schema.buildObjectType({
      name: "SanityVolunteerFixedRole",
      interfaces: ["Node"],
      fields: {
        name: { type: "String" },
        description: { type: "String" },
        detail: { type: "String" },
        pointValue: { type: "Int" },
      },
    }),
    schema.buildObjectType({
      name: "SanityMotorsportRegEvent",
      fields: {
        eventId: { type: "String" },
        name: { type: "String" },
        start: { type: "Date" },
        end: { type: "Date" },
        url: { type: "String" },
        imageUrl: { type: "String" },
        venueName: { type: "String" },
        venueCity: { type: "String" },
        venueRegion: { type: "String" },
        organizationId: { type: "String" },
      },
    }),
    schema.buildObjectType({
      name: "SanityVolunteerRole",
      interfaces: ["Node"],
      extensions: {
        infer: false,
      },
      fields: {
        role: { type: "SanityVolunteerFixedRole" },
        slug: { type: "SanitySlug" },
        active: { type: "Boolean" },
        isActive: {
          type: "Boolean!",
          resolve: (source) => Boolean(source.active),
        },
        date: { type: "Date" },
        duration: { type: "Float" },
        compensation: { type: "String" },
        skillLevel: { type: "String" },
        membershipRequired: { type: "Boolean" },
        descriptionPdf: { type: "SanityFile" },
        motorsportRegEvent: { type: "SanityMotorsportRegEvent" },
      },
    }),
  ]);
};

// HOME PAGE

async function createLandingPages(pathPrefix = "/", graphql, actions, reporter) {
  const { createPage } = actions;
  const result = await graphql(`
    {
      allSanityRoute(filter: { slug: { current: { ne: null } }, page: { id: { ne: null } } }) {
        edges {
          node {
            id
            slug {
              current
            }
          }
        }
      }
    }
  `);

  if (result.errors) throw result.errors;

  const routeEdges = (result.data.allSanityRoute || {}).edges || [];
  routeEdges.forEach((edge) => {
    const { id, slug = {} } = edge.node;
    const path = [pathPrefix, slug.current, "/"].join("");
    reporter.info(`Creating landing page: ${path}`);
    createPage({
      path,
      component: require.resolve("./src/templates/page.js"),
      context: { id },
    });
  });
}

// ZUNDFOLGE PAGE

async function createZundfolgePages(pathPrefix = "/zundfolge", graphql, actions, reporter) {
  const { createPage } = actions;
  const zundfolgeArticleTemplate = require.resolve("./src/templates/zundfolge-article.js")
  const zundfolgeLandingTemplate = require.resolve("./src/templates/zundfolge.js")
  await graphql(`
    {
      allSanityPost(
        filter: { slug: { current: { ne: null } }, isPublished: { eq: true } }
        sort: { fields: [publishedAt], order: ASC }
        ) {
        edges {
          node {
            id
            publishedAt
            slug {
              current
            }
          }
          next {
            id
            publishedAt
          }
          previous {
            id
            publishedAt
          }
        }
      }
    }
  `).then(result => {
    const postEdges = (result.data.allSanityPost || {}).edges || [];
    postEdges
    .filter((edge) => !isFuture(parseISO(edge.node.publishedAt)))
    .forEach((edge) => {
      const { id, slug = {} } = edge.node;
      const { next, previous } = edge;
      const path = `${pathPrefix}/${slug.current}/`;
      reporter.info(`Creating zundfolge article page: ${path}`);
      createPage({
        path,
        component: zundfolgeArticleTemplate,
        context: { 
          id,
          next: next ? next.id : null, 
          prev: previous ? previous.id : null
        },
      });
    });
    const articlePerPage = 6
    const numPages = Math.ceil(postEdges.length / articlePerPage)

    Array.from({length: numPages }).forEach((_, i) => {
      const path = i === 0 ? `${pathPrefix}/` : `${pathPrefix}/page/${i + 1}`
      reporter.info(`Creating zundfolge landing page: ${path}`);
      createPage({
        path,
        component: zundfolgeLandingTemplate,
        context: {
          limit: articlePerPage,
          skip: i * articlePerPage,
          numPages,
          currentPage: i + 1
        }
      })
    })
  })
}

// EVENT PAGE

async function createEventPages(pathPrefix = "/events", graphql, actions, reporter) {
  const { createPage } = actions;
  const eventPageTemplate = require.resolve("./src/templates/event-page.js")
  const eventPageLandingPage = require.resolve("./src/templates/events.js")
  await graphql(`
    {
      allSanityEvent(
        filter: { slug: { current: { ne: null } } }
        sort: { fields: [startTime], order: ASC }
        ) {
        edges {
          node {
            id
            startTime
            slug {
              current
            }
          }
          next {
            id
            startTime
          }
          previous {
            id
            startTime
          }
        }
      }
    }
  `).then(result => {
    const eventEdges = (result.data.allSanityEvent || {}).edges || [];
    eventEdges.forEach((edge) => {
      const { id, slug = {} } = edge.node;
      const { next, previous } = edge;
      const path = `${pathPrefix}/${slug.current}/`;
      reporter.info(`Creating events page: ${path}`);
      createPage({
        path,
        component: eventPageTemplate,
        context: {
          id,
          next: next ? next.id : null,
          prev: previous ? previous.id : null,
        },
      });
    });
      const eventPerPage = 6
      const numPages = Math.ceil(eventEdges.length / eventPerPage)
  
      Array.from({length: numPages }).forEach((_, i) => {
        const path = i === 0 ? `${pathPrefix}/` : `${pathPrefix}/page/${i + 1}`
        reporter.info(`Creating events landing page: ${path}`);
        createPage({
          path,
          component: eventPageLandingPage,
          context: {
            limit: eventPerPage,
            skip: i * eventPerPage,
            numPages,
            currentPage: i + 1
          }
        })
      })

  })
}

// ARCHIVE PAGE

async function createArchivePages(pathPrefix = "/zundfolge/archive", graphql, actions, reporter) {
  const { createPage } = actions;
  const archiveTemplate = require.resolve("./src/templates/archive.js");

  const path = `${pathPrefix}/`;
  reporter.info(`Creating archive page: ${path}`);
  createPage({
    path,
    component: archiveTemplate,
    context: {},
  });
}

// VOLUNTEER ROLE PAGES

async function createVolunteerRolePages(pathPrefix = "/volunteer", graphql, actions, reporter) {
  const { createPage } = actions;
  const volunteerRoleTemplate = require.resolve("./src/templates/volunteer-role.js");
  await graphql(`
    {
      allSanityVolunteerRole {
        edges {
          node {
            id
            slug {
              current
            }
          }
        }
      }
    }
  `).then((result) => {
    if (result.errors) {
      throw result.errors;
    }
    const roleEdges = (result?.data?.allSanityVolunteerRole || {}).edges || [];
    if (roleEdges.length === 0) {
      reporter.info("No volunteer positions found; skipping position page creation.");
      return;
    }
    roleEdges.forEach((edge) => {
      const { id, slug = {} } = edge.node;
      const normalizedPath = slug?.current
        ? normalizeVolunteerPath(slug.current, pathPrefix)
        : buildVolunteerFallbackPath(id, pathPrefix);
      const path = normalizedPath.endsWith("/") ? normalizedPath : `${normalizedPath}/`;
      reporter.info(`Creating volunteer position page: ${path}`);
      createPage({
        path,
        component: volunteerRoleTemplate,
        context: { id },
      });
    });
  });
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  await createLandingPages("/", graphql, actions, reporter);
  await createZundfolgePages("/zundfolge", graphql, actions, reporter);
  await createEventPages("/events", graphql, actions, reporter);
  await createVolunteerRolePages("/volunteer", graphql, actions, reporter);
  await createArchivePages("/zundfolge/archive", graphql, actions, reporter);
};

const path = require("path")

exports.onCreateWebpackConfig = ({ actions, stage, loaders }) => {
  const config = {
    resolve: {
      modules: [path.resolve(__dirname, "src"), "node_modules"],
    },
  }

  // when building HTML, window is not defined, so Leaflet causes the build to blow up
  if (stage === "build-html") {
    config.module = {
      rules: [
        {
          test: /mapbox-gl/,
          use: loaders.null(),
        },
      ],
    }
  }

  actions.setWebpackConfig(config)
}
