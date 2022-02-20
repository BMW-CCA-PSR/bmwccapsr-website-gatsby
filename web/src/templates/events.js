/** @jsxImportSource theme-ui */
import React from "react";
import { graphql, Link } from "gatsby";
import {
  mapEdgesToNodes,
  filterOutDocsWithoutSlugs,
  filterOutDocsPublishedInTheFuture
} from "../lib/helpers";
import { Container, Heading } from "@theme-ui/components";
import GraphQLErrorList from "../components/graphql-error-list";
import SEO from "../components/seo";
import Layout from "../containers/layout";
import EventPagePreview from "../components/event-page-preview";

export const query = graphql`
query EventPageQuery($skip: Int!, $limit: Int!) {
    site: sanitySiteSettings(_id: {regex: "/(drafts.|)siteSettings/"}) {
      title
      navMenu {
        ...NavMenu
      }
    }
    events: allSanityEvent(
      limit: $limit
      skip: $skip
      sort: {fields: [startTime], order: ASC}
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
          category {
            title
          }
          endTime
          location {
            lat
            lng
          }
          address {
            city
            state
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
  const prevPage = currentPage - 1 === 1 ? "/events" : `/events/page/${(currentPage - 1).toString()}`
  const nextPage =  `/events/page/${(currentPage + 1).toString()}`


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
        pl: ["16px", "16px", "50px", "100px"],
        pr: ["16px", "16px", "50px", "100px"],
        //pr: "16px",
        pt: ["6.5rem","6.5rem","10rem","10rem"],
        pb: "1rem",
      }}>
        <h1 hidden>Welcome to {site.title}</h1>
        <Heading sx={{variant: "styles.h1", pb: "1rem"}}>Events</Heading>
        <Heading sx={{variant: "styles.h3", borderBottomStyle: "solid", pb: "3px", borderBottomWidth: "3px", my: "0.5rem"}}>All Events</Heading>
        <div>
          <ul sx={{
            listStyle: 'none',
            display: 'grid',
            gridGap: 3,
            gridTemplateColumns: 'repeat(auto-fit, minmax(max(250px, 35vw), 1fr))',
            gridAutoRows: "minmax(50px, 300px)",
            m: 0,
            p: 0
          }}>
            {eventNodes &&
              eventNodes.map((node, index) => {
                return <li
                  key={index}>
                    <EventPagePreview {...node} isInList />
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
                    to={`/events/${i === 0 ? '' : '/events/page/' + (i + 1)}`}
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