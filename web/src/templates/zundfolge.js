/** @jsxImportSource theme-ui */
import React from "react";
import { Link, graphql } from "gatsby";
import {
  mapEdgesToNodes,
  filterOutDocsWithoutSlugs,
  filterOutDocsPublishedInTheFuture
} from "../lib/helpers";
import ZundfolgeArticleGallery from "../components/zundfolge-article-gallery";
import { Container, Heading, Text } from "@theme-ui/components";
import GraphQLErrorList from "../components/graphql-error-list";
import SEO from "../components/seo";
import Layout from "../containers/layout";
import ZundfolgeArticlePreview from "../components/zundfolge-article-preview";

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
        description={site.description || "Missing description"}
        keywords={site.keywords || []}
      />
      <Container sx ={{
        pl: ["16px", "16px", "50px", "100px"],
        pr: ["16px", "16px", "50px", "100px"],
        //pr: "16px",
        pt: ["6.5rem","6.5rem","10rem","10rem"],
        pb: "1rem",
      }}>
        <h1 hidden>Welcome to {site.title}</h1>
        <Heading sx={{variant: "styles.h1", pb: "1rem"}}>Zündfolge</Heading>
        <div sx={{display: "flex", flexDirection: "column"}}>
          <div sx={{pb: "0.5rem"}}><Text sx={{variant: "styles.h5", color: "highlight"}}>1</Text> — German for <i>"firing order"</i>.</div>
          <div><Text sx={{variant: "styles.h5", color: "highlight"}}>2</Text> — The official newsletter of the Puget Sound Chapter CCA Since 1975.</div>
        </div>
        <Heading sx={{variant: "styles.h3", borderBottomStyle: "solid", pb: "3px", borderBottomWidth: "3px", my: "0.5rem"}}>Latest Stories</Heading>
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
          <div>
            <ul
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                listStyle: 'none',
                padding: 0,
              }}
            >
              {!isFirst && (
                <Link to={prevPage} rel="prev" sx={{
                  marginTop: '0.1rem', 
                  textDecoration: "none",
                  marginBottom: '0.1rem', 
                  padding: '0.5rem', 
                  color: 'text'
                  }}>
                  {"<< Prev"}
                </Link>
              )}
              {Array.from({ length: numPages }, (_, i) => (
                <li
                  key={`pagination-number${i + 1}`}
                  style={{
                    margin: 0,
                  }}
                >
                  <Link
                    to={`/zundfolge/${i === 0 ? '' : 'page/' + (i + 1)}`}
                    sx={{
                      marginTop: '0.1rem',
                      marginBottom: '0.1rem',
                      padding: '0.5rem',
                      textDecoration: 'none',
                      color: i + 1 === currentPage ? '#ffffff' : 'black',
                      background: i + 1 === currentPage ? 'primary' : '',
                    }}
                  >
                    {i + 1}
                  </Link>
                </li>
              ))}
              {!isLast && (
                <Link to={nextPage} rel="next" sx={{ 
                  marginTop: '0.1rem', 
                  textDecoration: "none",
                  marginBottom: '0.1rem', 
                  padding: '0.5rem', 
                  color: 'text' }}>
                  {"Next >>"}
                </Link>
              )}
            </ul>
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default IndexPage;