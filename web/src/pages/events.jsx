/** @jsxImportSource theme-ui */
import React from "react";
import { graphql } from "gatsby";
import {
  mapEdgesToNodes,
  filterOutDocsWithoutSlugs,
  filterOutDocsPublishedInTheFuture
} from "../lib/helpers";
import EventPagePreviewGrid from "../components/event-page-preview-list";
import { Container } from "@theme-ui/components";
import GraphQLErrorList from "../components/graphql-error-list";
import SEO from "../components/seo";
import Layout from "../containers/layout";

export const query = graphql`
query EventPageQuery {
    site: sanitySiteSettings(_id: {regex: "/(drafts.|)siteSettings/"}) {
      title
      navMenu {
        ...NavMenu
      }
    }
    events: allSanityEvent(
      limit: 6
      sort: {fields: [startTime], order: DESC}
      filter: {slug: {current: {ne: null}}, isActive: {eq: true}}
    ) {
      edges {
        node {
          id
          startTime
          mainImage {
            ...SanityImage
            alt
            asset {
              metadata {
                lqip
              }
            }
          }
          title
          _rawExcerpt
          slug {
            current
          }
          categories {
            title
          }
          endTime
          location {
            lat
            lng
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
  const eventNodes = (data || {}).events
    ? mapEdgesToNodes(data.events)
        .filter(filterOutDocsWithoutSlugs)
        .filter(filterOutDocsPublishedInTheFuture)
    : [];
  if (!site) {
    console.warn(
      'Missing "Site settings". Open the studio at http://localhost:3333 and add some content to "Site settings" and restart the development server.'
    );
  }
  const menuItems = site.navMenu && (site.navMenu.items || []);
  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <SEO
        title={site.title || "Missing title"}
        description={site.description || "Missing description"}
        keywords={site.keywords || []}
      />
      <Container sx ={{
        mt: "6rem",
      }}>
        <h1 hidden>Welcome to {site.title}</h1>
        <div>
          {eventNodes && <EventPagePreviewGrid nodes={eventNodes} />}
        </div>
      </Container>
    </Layout>
  );
};

export default IndexPage;