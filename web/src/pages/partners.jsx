/** @jsxImportSource theme-ui */
import React from "react";
import { graphql } from "gatsby";
import SponsorPageGrid from "../components/sponsor-page-grid";
import { Heading } from "@theme-ui/components";
import GraphQLErrorList from "../components/graphql-error-list";
import Layout from "../containers/layout";
import ContentContainer from "../components/content-container";
import { BoxIcon } from "../components/box-icons";
import StylizedLandingHeader from "../components/stylized-landing-header";

export const query = graphql`
  query SponsorPageQuery {
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
    ads: allSanityAdvertiser(sort: { fields: [name], order: ASC }) {
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
          _rawLogo(resolveReferences: { maxDepth: 10 })
          name
          href
        }
      }
    }
  }
`;

const IndexPage = (props) => {
  const { data, errors } = props;

  if (errors) {
    return (
      <Layout>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  const site = (data || {}).site;
  const ads = data.ads;
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
      <ContentContainer
        sx={{
          pl: ["16px", "16px", "50px", "100px"],
          pr: ["16px", "16px", "50px", "100px"],
          pt: ["6.5rem", "6.5rem", "10rem", "10rem"],
          pb: "1rem",
        }}
      >
        <h1 hidden>Welcome to {site.title}</h1>
        <StylizedLandingHeader
          word="Partners"
          color="black"
          bleedTop="65px"
          topInset={["11rem", "12rem", "15rem", "17rem"]}
          minHeight="0px"
          patternViewportInset={[
            "0 0 1rem 0",
            "0 0 1.25rem 0",
            "0 0 1.6rem 0",
            "0 0 2rem 0",
          ]}
          rowCount={22}
          rowRepeatCount={30}
          textFontSize={["30px", "36px", "46px", "56px"]}
          rowHeight={["1.55rem", "1.8rem", "2.25rem", "2.7rem"]}
          rowGap={["0.08rem", "0.1rem", "0.12rem", "0.16rem"]}
          rowOverflow="visible"
          textLineHeight={0.94}
          textTranslateY="0%"
          patternInset={["-44% -70%", "-44% -70%", "-46% -58%", "-48% -52%"]}
          patternTransform={[
            "translateY(-4%) rotate(-45deg) scale(1.08)",
            "translateY(-4%) rotate(-45deg) scale(1.08)",
            "translateY(-2%) rotate(-45deg) scale(1.1)",
            "translateY(-2%) rotate(-45deg) scale(1.12)",
          ]}
          rowContents={["PARTNERS"]}
        />
        <Heading as="h1" sx={{ variant: "styles.h1", pb: "1rem" }}>
          Partners
          <BoxIcon
            as="span"
            sx={{
              display: "inline-grid",
              ml: "0.5rem",
              verticalAlign: "middle",
            }}
          />
        </Heading>
        {ads && <SponsorPageGrid {...ads} />}
      </ContentContainer>
    </Layout>
  );
};

export default IndexPage;
