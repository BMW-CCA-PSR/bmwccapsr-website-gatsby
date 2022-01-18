const { isFuture, parseISO } = require("date-fns");
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

exports.createSchemaCustomization = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: "SanityPost",
      interfaces: ["Node"],
      fields: {
        isPublished: {
          type: "Boolean!",
          resolve: (source) => new Date(source.publishedAt) <= new Date(),
        },
        related: {
          type: "[SanityPost]",
          //The resolve field is called when your page query looks for related posts
          //Here we can query our data for posts we deem 'related'
          //Exactly how you do this is up to you
          //I'm querying purely by category
          //But you could pull every single post and do a text match if you really wanted
          //(note that might slow down your build time a bit)
          //You could even query an external API if you needed
          resolve: async (source, args, context, info) => {
            //source is the current (post) object
            //context provides some methods to interact with the data store
            
            //Map a simple array of category IDs from our source object
            //In my data each category in the array is an object with a _id field
            //We're just flattening that to an array of those _id values
            //E.g. categories = ["1234", "4567", "4534"]
            const categories = source.categories.map((c) => c._id)
            
            //If this post has no categories, return an empty array
            if (!categories.length) return []
            
            //Query the data store for posts in our target categories
            const posts = await context.nodeModel.runQuery({
              query: {
                filter: {
                  //We're filtering for categories that are sharedby our source node
                  categories: { elemMatch: { _id: { in: categories } } },
                  //Dont forget to exclude the current post node!
                  _id: { ne: source._id },
                },
              },
              //Change this to match the data type of your posts
              //This will vary depending on how you source content
              type: "SanityPost",
            })

            //Gatsby gets unhappy if we return "null" here
            //So check the result and either return an array of posts,
            //or an empty array
            return posts && posts.length ? posts : []
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
  const result = await graphql(`
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
  `);

  if (result.errors) throw result.errors;

  const postEdges = (result.data.allSanityPost || {}).edges || [];
  postEdges
    .filter((edge) => !isFuture(parseISO(edge.node.publishedAt)))
    .forEach((edge) => {
      const { id, slug = {} } = edge.node;
      const { next, previous } = edge;
      const path = `${pathPrefix}/${slug.current}/`;
      reporter.info(`Creating zundfolge page: ${path}`);
      createPage({
        path,
        component: require.resolve("./src/templates/zundfolge-article.js"),
        context: { 
          id,
          next: next ? next.id : null, 
          prev: previous ? previous.id : null
        },
      });
    });
}

// EVENT PAGE

async function createEventPages(pathPrefix = "/events", graphql, actions, reporter) {
  const { createPage } = actions;
  const result = await graphql(`
    {
      allSanityEvent(
        filter: { slug: { current: { ne: null } }, isActive: { eq: true } }
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
  `);

  if (result.errors) throw result.errors;

  const eventEdges = (result.data.allSanityEvent || {}).edges || [];
  eventEdges
    .filter((edge) => isFuture(parseISO(edge.node.startTime)))
    .forEach((edge) => {
      const { id, slug = {} } = edge.node;
      const { next, previous } = edge;
      const path = `${pathPrefix}/${slug.current}/`;
      reporter.info(`Creating events page: ${path}`);
      createPage({
        path,
        component: require.resolve("./src/templates/event-page.js"),
        context: { 
          id,
          next: next ? next.id : null, 
          prev: previous ? previous.id : null
        },
      });
    });
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  await createLandingPages("/", graphql, actions, reporter);
  await createZundfolgePages("/zundfolge", graphql, actions, reporter);
  await createEventPages("/events", graphql, actions, reporter);
};
