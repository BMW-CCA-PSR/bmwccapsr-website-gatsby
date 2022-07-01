import React, { Component } from "react";
import { graphql } from "gatsby";
import Errors from "../components/errors";
import Page from "../templates/page";

export const query = graphql`
  fragment SanityImage on SanityMainImage {
    alt
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
      metadata {
        lqip
        dimensions {
          aspectRatio
          width
          height
        }
        palette {
          dominant {
            background
            foreground
          }
        }
      }
    }
  }
  query FrontpageQuery {
    page: sanityPage(_id: { regex: "/(drafts.|)frontpage/" }) {
      ...PageInfo
    }
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
      openGraph {
        title
        description
        image {
          ...SanityImage
        }
      }
    }
    post: allSanityPost(
      filter: {slug: {current: {ne: null}}, isPublished: {eq: true}}
      sort: {fields: [publishedAt], order: DESC}
    ) {
      edges {
        node {
          id
          publishedAt
          title
          _rawBody(resolveReferences: {maxDepth: 1})
          _rawExcerpt(resolveReferences: {maxDepth: 1})
          slug {
            current
          }
          _rawMainImage(resolveReferences: {maxDepth: 1})
          mainImage {
            ...SanityImage
          }
          category {
            title
          }
          authors {
            author {
              name
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
            }
          }
        }
      }
    }
    event: allSanityEvent(
      filter: {isActive: {eq: true}}
      sort: {order: ASC, fields: startTime}
    ) {
      edges {
        node {
          title
          slug {
            current
          }
        }
      }
    }
    ads: allSanityAdvertiser(filter: {active: {eq: true}}) {
      edges {
        node {
          category {
            title
          }
          tier {
            title
          }
          _rawLogo(resolveReferences: {maxDepth: 10})
          name
          href
        }
      }
    }
    banners: allSanityAdvertiser(filter: {banner: {_type: {ne: null}}}) {
      edges {
        node {
          _rawBanner(resolveReferences: {maxDepth: 10})
          href
        }
      }
    }
    boxes: allSanityAdvertiser(filter: {box: {_type: {ne: null}}}) {
      edges {
        node {
          _rawBox(resolveReferences: {maxDepth: 10})
          href
        }
      }
    }
    slideAds: allSanityAdvertiser(
      filter: {slideAd: {_type: {ne: null}, disabled: {ne: true}}, tier: {title: {eq: "Platinum"}}}
    ) {
      edges {
        node {
          _rawSlideAd(resolveReferences: {maxDepth: 10})
        }
      }
    }
  }
`;

const IndexPage = (props) => {
  const { data, errors } = props;
  if (errors) {
    return <Errors errors={errors} />;
  }
  return <Page data={data} />;
};

export default IndexPage;