import React from "react";
import { graphql } from "gatsby";
import GraphQLErrorList from "../components/graphql-error-list";
import ZundfolgeArticle from "../components/zundfolge-article";
import RelatedContent from "../components/related-content";
import SEO from "../components/seo";
import Layout from "../containers/layout";
import { Container } from "@theme-ui/components";
import { toPlainText } from "../lib/helpers";

export const query = graphql`
  query BlogPostTemplateQuery($id: String!, $next: String, $prev: String) {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    post: sanityPost(id: { eq: $id }) {
      id
      publishedAt
      categories {
        _id
        title
      }
      mainImage {
        ...SanityImage
        alt
      }
      title
      slug {
        current
      }
      _rawExcerpt(resolveReferences: { maxDepth: 5 })
      _rawBody(resolveReferences: { maxDepth: 5 })
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
            }
          }
          name
        }
      }
    }
    next: sanityPost(id: { eq: $next }) {
      id
      publishedAt
      categories {
        _id
        title
      }
      mainImage {
        ...SanityImage
        alt
      }
      title
      slug {
        current
      }
    }
    prev: sanityPost(id: { eq: $prev }) {
      id
      publishedAt
      categories {
        _id
        title
      }
      mainImage {
        ...SanityImage
        alt
      }
      title
      slug {
        current
      }
    }
  }
`;

const ZundfolgePostTemplate = props => {
  const { data, errors } = props;
  const post = data && data.post;
  const site = data && data.site;
  const next = data && data.next;
  const prev = data && data.prev;
  const menuItems = site.navMenu && (site.navMenu.items || []);
  return (
    <Layout textWhite={true} navMenuItems={menuItems} >
      {errors && <SEO title="GraphQL Error" />}
      {post && (
        <SEO
          title={post.title || "Untitled"}
          description={toPlainText(post._rawExcerpt)}
          image={post.mainImage}
        />
      )}

      {errors && (
        <Container>
          <GraphQLErrorList errors={errors} />
        </Container>
      )}

      {post && <ZundfolgeArticle {...post} />}
      {next && <RelatedContent {...next} /> }
      {prev && <RelatedContent {...prev} /> }
    </Layout>
  );
};

export default ZundfolgePostTemplate;