/** @jsxImportSource theme-ui */
import React from "react";
import { graphql } from "gatsby";
import {
  mapEdgesToNodes,
  filterOutDocsWithoutSlugs,
  filterOutDocsPublishedInTheFuture
} from "../lib/helpers";
import ZundfolgeArticlePreviewGrid from "../components/zundfolge-article-preview-grid";
import ZundfolgeArticleGallery from "../components/zundfolge-article-gallery";
import { Container, Heading } from "@theme-ui/components";
import GraphQLErrorList from "../components/graphql-error-list";
import SEO from "../components/seo";
import Layout from "../containers/layout";

export const query = graphql`
  query ZundfolgePageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    posts: allSanityPost(
      limit: 6
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
          categories {
            title
          }
        }
      }
    }
  }
`;

const IndexPage = props => {
  const { data, errors } = props;

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

  const galleryNodes = postNodes.splice(indexToRemove, numberToRemove);
  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <SEO
        title={site.title || "Missing title"}
        description={site.description || "Missing description"}
        keywords={site.keywords || []}
      />
      <Container sx ={{
        pl: ["50px", "50px", "50px", "100px"],
        pr: "1rem",
        pt: "10rem",
      }}>
        <h1 hidden>Welcome to {site.title}</h1>
        <Heading sx={{variant: "styles.h1", pb: "1rem"}}>Zündfolge</Heading>
        {postNodes && <ZundfolgeArticleGallery nodes={galleryNodes}/>}
        {postNodes && <ZundfolgeArticlePreviewGrid nodes={postNodes} />}
      </Container>
    </Layout>
  );
};

export default IndexPage;