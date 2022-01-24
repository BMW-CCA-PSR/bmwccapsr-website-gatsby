import React from "react";
import { graphql } from "gatsby";
import GraphQLErrorList from "../components/graphql-error-list";
import ZundfolgeArticle from "../components/zundfolge-article";
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
      relatedPosts {
        categories {
          _id
          title
        }
        publishedAt
        title
        slug {
          current
        }
        mainImage {
          ...SanityImage
          alt
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
              gatsbyImageData
              url
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
    boxes: allSanityAdvertiser(filter: {box: {_type: {ne: null}}}) {
      edges {
        node {
          _rawBox(resolveReferences: {maxDepth: 10})
        }
      }
    }
    banners: allSanityAdvertiser(filter: {banner: {_type: {ne: null}}}) {
      edges {
        node {
          _rawBanner(resolveReferences: {maxDepth: 10})
        }
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
  const boxes = data && data.boxes;
  const banners = data && data.banners;
  const pageData = {...post, next: next ? {...next} : null, prev: prev ? {...prev} : null, boxes: {...boxes}, banners: {...banners}}
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

      {post && <ZundfolgeArticle {...pageData} />}
    </Layout>
  );
};

export default ZundfolgePostTemplate;