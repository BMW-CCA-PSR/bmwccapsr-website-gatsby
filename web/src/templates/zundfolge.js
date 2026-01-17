/** @jsxImportSource theme-ui */
import React from "react";
import { Link, graphql, withPrefix } from "gatsby";
import {
  mapEdgesToNodes,
  filterOutDocsWithoutSlugs,
  filterOutDocsPublishedInTheFuture
} from "../lib/helpers";
import ZundfolgeArticleGallery from "../components/zundfolge-article-gallery";
import { Heading, Text, Card, Box, Button } from "@theme-ui/components";
import { FiArchive } from "react-icons/fi";
import GraphQLErrorList from "../components/graphql-error-list";
import SEO from "../components/seo";
import Layout from "../containers/layout";
import ZundfolgeArticlePreview from "../components/zundfolge-article-preview";
import ContentContainer from "../components/content-container";
import { BoxIcon } from "../components/box-icons";

const zundfolgeRed = "#B5322E";
const buildPaginationItems = (current, total, delta = 2) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => ({
      type: "page",
      value: i + 1
    }));
  }
  const items = [{ type: "page", value: 1 }];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  if (left > 2) {
    items.push({ type: "ellipsis", key: "left" });
  }
  for (let i = left; i <= right; i += 1) {
    items.push({ type: "page", value: i });
  }
  if (right < total - 1) {
    items.push({ type: "ellipsis", key: "right" });
  }
  items.push({ type: "page", value: total });
  return items;
};

export const query = graphql`
  query ZundfolgePageQuery($skip: Int!, $limit: Int!) {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    posts: allSanityPost(
      limit: $limit
      skip: $skip
      sort: { fields: [publishedAt], order: DESC }
      filter: { slug: { current: { ne: null } }, publishedAt: { ne: null } }
    ) {
      edges {
        node {
          id
          publishedAt
          mainImage {
            ...SanityImage
            alt
          }
          title
          _rawExcerpt
          slug {
            current
          }
          category {
            title
          }
          authors {
            _key
            author {
              image {
                crop {
                  _key
                  _type
                  top
                  bottom
                  left
                  right
                }
                hotspot {
                  _key
                  _type
                  x
                  y
                  height
                  width
                }
                asset {
                  _id
                  gatsbyImageData
                  url
                }
              }
              name
            }
          }
        }
      }
    }
  }
`;

const IndexPage = props => {
  const { data, errors, pageContext } = props;
  const { numPages, limit, skip, currentPage } = pageContext
  const isFirst = currentPage === 1
  const isLast = currentPage === numPages
  const prevPage = currentPage - 1 === 1 ? "/zundfolge" : `/zundfolge/page/${(currentPage - 1).toString()}`
  const nextPage =  `/zundfolge/page/${(currentPage + 1).toString()}`
  const paginationItems = buildPaginationItems(currentPage, numPages);

  if (errors) {
    return (
      <Layout>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  const site = (data || {}).site;
  const postNodes = (data || {}).posts
    ? mapEdgesToNodes(data.posts)
        .filter(filterOutDocsWithoutSlugs)
        .filter(filterOutDocsPublishedInTheFuture)
    : [];
  if (!site) {
    console.warn(
      'Missing "Site settings". Open the studio at http://localhost:3333 and add some content to "Site settings" and restart the development server.'
    );
  }
  const menuItems = site.navMenu && (site.navMenu.items || []);
  const indexToRemove = 0;
  const numberToRemove = 4;
  var galleryNodes = []
  if (isFirst){
    galleryNodes = postNodes.splice(indexToRemove, numberToRemove);
  }
  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <SEO
        title={site.title || "Missing title"}
        description="BMW CCA PSR Zundfolge Online"
        keywords={site.keywords || []}
      />
      <ContentContainer sx ={{
        pl: ["16px", "16px", "50px", "100px"],
        pr: ["16px", "16px", "50px", "100px"],
        //pr: "16px",
        pt: ["6.5rem","6.5rem","10rem","10rem"],
        pb: "1rem",
      }}>
        <h1 hidden>Welcome to {site.title}</h1>
        <div
          sx={{
            display: "grid",
            gridTemplateColumns: ["1fr", "1fr", "1fr 420px"],
            alignItems: "stretch",
            gap: 3,
            pb: "1rem",
          }}
        >
          <div>
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.75rem", mb: 2 }}>
              <Heading sx={{ variant: "styles.h1", mb: 0, color: zundfolgeRed }}>Zündfolge</Heading>
              <BoxIcon />
            </Box>
            <div sx={{display: "flex", flexDirection: "column"}}>
              <div sx={{pb: "0.5rem"}}><Text sx={{variant: "styles.h5", color: "highlight"}}>1</Text> — German for <i>"firing order"</i>.</div>
              <div><Text sx={{variant: "styles.h5", color: "highlight"}}>2</Text> — The official newsletter of the Puget Sound Chapter CCA Since 1975.</div>
            </div>
          </div>
          <div sx={{ display: ["none", "none", "block"], minHeight: 220 }}>
            <Link to="/archive/" sx={{ textDecoration: 'none' }} aria-label="Open the Zündfolge archive">
              <Card
                sx={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%), url(${withPrefix('/images/zundfolge-archive-collage.png')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  height: '100%',
                  mx: 'auto',
                  borderRadius: '8px',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: '1px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                <Box p={3}>
                  <Text sx={{ variant: 'text.label', color: 'white' }}>Archive</Text>
                  <Heading sx={{ textDecoration: 'none', variant: 'styles.h3', color: 'white' }}>Zündfolge Archive</Heading>
                  <Text sx={{ color: 'white', opacity: 0.9 }}>Browse decades of issues, covers, and stories.</Text>
                </Box>
              </Card>
            </Link>
          </div>
        </div>
        <Heading
          sx={{
            variant: "styles.h3",
            borderBottomStyle: "solid",
            pb: "3px",
            borderBottomWidth: "3px",
            my: "0.5rem"
          }}
        >
          {isFirst ? "Latest Stories" : "Older Stories"}
        </Heading>
        <div>
          {isFirst && <ZundfolgeArticleGallery nodes={galleryNodes}/>}
          <ul sx={{
            listStyle: 'none',
            display: 'grid',
            gridGap: 3,
            gridTemplateColumns: 'repeat(auto-fit, minmax(max(250px, 35vw), 1fr))',
            gridAutoRows: "minmax(50px, 300px)",
            m: 0,
            p: 0
          }}>
            {postNodes.map((node, index) => {
                return <li
                  key={index}>
                  <ZundfolgeArticlePreview {...node} />
                </li>
              })}
          </ul>
          {numPages > 1 && (
            <Box
              sx={{
                mt: "1.5rem",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "0.4rem"
              }}
            >
              <Button
                as={isFirst ? "span" : Link}
                to={isFirst ? undefined : prevPage}
                rel="prev"
                disabled={isFirst}
                sx={{
                  variant: "buttons.primary",
                  bg: isFirst ? "lightgray" : "background",
                  color: isFirst ? "darkgray" : "text",
                  border: "1px solid",
                  borderColor: "gray",
                  px: "0.9rem",
                  py: "0.4rem",
                  cursor: isFirst ? "not-allowed" : "pointer",
                  textDecoration: "none",
                  "&:hover": {
                    bg: isFirst ? "lightgray" : "highlight",
                    color: isFirst ? "darkgray" : "text"
                  }
                }}
              >
                Prev
              </Button>
              {paginationItems.map((item, index) => {
                if (item.type === "ellipsis") {
                  return (
                    <Box
                      key={`pagination-ellipsis-${item.key}-${index}`}
                      sx={{
                        px: "0.6rem",
                        py: "0.4rem",
                        color: "gray",
                        alignSelf: "center"
                      }}
                    >
                      ...
                    </Box>
                  );
                }
                const isActive = item.value === currentPage;
                const path =
                  item.value === 1
                    ? "/zundfolge"
                    : `/zundfolge/page/${item.value}`;
                return (
                  <Button
                    key={`pagination-number-${item.value}`}
                    as={isActive ? "span" : Link}
                    to={isActive ? undefined : path}
                    aria-current={isActive ? "page" : undefined}
                    sx={{
                      variant: "buttons.primary",
                      bg: isActive ? "primary" : "background",
                      color: isActive ? "white" : "text",
                      border: "1px solid",
                      borderColor: "gray",
                      px: "0.8rem",
                      py: "0.4rem",
                      minWidth: "42px",
                      textDecoration: "none",
                      "&:hover": {
                        bg: isActive ? "primary" : "highlight",
                        color: isActive ? "white" : "text"
                      }
                    }}
                  >
                    {item.value}
                  </Button>
                );
              })}
              <Button
                as={isLast ? "span" : Link}
                to={isLast ? undefined : nextPage}
                rel="next"
                disabled={isLast}
                sx={{
                  variant: "buttons.primary",
                  bg: isLast ? "lightgray" : "background",
                  color: isLast ? "darkgray" : "text",
                  border: "1px solid",
                  borderColor: "gray",
                  px: "0.9rem",
                  py: "0.4rem",
                  cursor: isLast ? "not-allowed" : "pointer",
                  textDecoration: "none",
                  "&:hover": {
                    bg: isLast ? "lightgray" : "highlight",
                    color: isLast ? "darkgray" : "text"
                  }
                }}
              >
                Next
              </Button>
            </Box>
          )}
        </div>
      </ContentContainer>
    </Layout>
  );
};

export default IndexPage;
