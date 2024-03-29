/** @jsxImportSource theme-ui */
import React from "react";
import { graphql } from "gatsby";
import SponsorPageGrid from "../components/sponsor-page-grid";
import { Container, Heading } from "@theme-ui/components";
import GraphQLErrorList from "../components/graphql-error-list";
import SEO from "../components/seo";
import Layout from "../containers/layout";

export const query = graphql`
query SponsorPageQuery {
    site: sanitySiteSettings(_id: {regex: "/(drafts.|)siteSettings/"}) {
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
    ads: allSanityAdvertiser(
      sort: { fields: [name], order: ASC }
      ) {
        edges {
            node {
                active
                partner
                discount
                category {
                    title
                }
                tier {
                    title
                    rate
                }
                _rawLogo(resolveReferences: {maxDepth: 10})
                name
                href
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
  const ads = data.ads
  if (!site) {
    console.warn(
      'Missing "Site settings". Open the studio at http://localhost:3333 and add some content to "Site settings" and restart the development server.'
    );
  }
  const menuItems = site.navMenu && (site.navMenu.items || []);
  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      {/* <SEO
        title={site.title || "Missing title"}
        description="Partners and Discounts offered to club members"
        keywords={site.keywords || []}
      /> */}
      <Container sx ={{
        pl: ["16px", "16px", "50px", "100px"],
        pr: ["16px", "16px", "50px", "100px"],
        pt: ["6.5rem","6.5rem","10rem","10rem"],
        pb: "1rem",
      }}>
        <h1 hidden>Welcome to {site.title}</h1>
        <Heading sx={{variant: "styles.h1", pb: "1rem"}}>Our Partners</Heading>
        {ads && <SponsorPageGrid {...ads} />}
      </Container>
    </Layout>
  );
};

export default IndexPage;