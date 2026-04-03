import React from "react";
import { graphql } from "gatsby";
import GraphQLErrorList from "../components/graphql-error-list";
import Seo from "../components/seo";
import Layout from "../containers/layout";
import EventPage from "../components/event-page";
import ContentContainer from "../components/content-container";
import { toPlainText } from "../lib/helpers";

export const query = graphql`
  query EventPageTemplateQuery($id: String!, $next: String, $prev: String) {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    event: sanityEvent(id: { eq: $id }) {
      id
      source
      sourceRegisterLink
      sourceRegistrationOpenAt
      sourceRegistrationCloseAt
      sourceRegistrationCount
      sourceConfirmedCount
      startTime
      endTime
      cost
      onlineEvent
      onlineLink
      website
      venueName
      address {
        line1
        line2
        state
        city
        postalCode
      }
      category {
        _id
        title
      }
      poc {
        contact
        name
        alias {
          name
        }
      }
      mainImage {
        ...SanityImage
        alt
      }
      title
      slug {
        current
      }
      location {
        lat
        lng
      }
      _rawExcerpt(resolveReferences: { maxDepth: 5 })
      _rawBody(resolveReferences: { maxDepth: 5 })
      _updatedAt(locale: "en_US")
    }
    next: sanityEvent(id: { eq: $next }) {
      id
      category {
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
      onlineEvent
      onlineLink
      venueName
      address {
        line1
        line2
        city
        state
        postalCode
      }
      startTime
    }
    prev: sanityEvent(id: { eq: $prev }) {
      id
      category {
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
      onlineEvent
      onlineLink
      venueName
      address {
        line1
        line2
        city
        state
        postalCode
      }
      startTime
    }
    boxes: allSanityAdvertiser(filter: {box: {_type: {ne: null}}, active: {eq: true}}) {
      edges {
        node {
          _rawBox(resolveReferences: {maxDepth: 10})
          href
        }
      }
    }
  }
`;

const EventPageTemplate = props => {
  const { data, errors } = props;
  const event = data && data.event;
  const site = data && data.site;
  const next = data && data.next;
  const prev = data && data.prev;
  const boxes = data && data.boxes;
  const pageData = {...event, next: next ? {...next} : null, prev: prev ? {...prev} : null, boxes: {...boxes}}
  const menuItems = site.navMenu && (site.navMenu.items || []);
  return (
    <Layout textWhite={true} navMenuItems={menuItems}>
      {errors && <Seo title="GraphQL Error" />}
      {event && (
        <Seo
          title={event.title || "Untitled"}
          description={toPlainText(event._rawExcerpt)}
          image={event.mainImage}
        />
      )}

      {errors && (
        <ContentContainer>
          <GraphQLErrorList errors={errors} />
        </ContentContainer>
      )}

      {event && <EventPage {...pageData} />}
    </Layout>
  );
};

export default EventPageTemplate;
