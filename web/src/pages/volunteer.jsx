/** @jsxImportSource theme-ui */
import React from "react";
import { graphql } from "gatsby";
import { Heading, Text } from "@theme-ui/components";
import GraphQLErrorList from "../components/graphql-error-list";
import Seo from "../components/seo";
import Layout from "../containers/layout";
import ContentContainer from "../components/content-container";
import { BoxIcon } from "../components/box-icons";

export const query = graphql`
  query VolunteerPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
  }
`;

const VolunteerPage = (props) => {
  const { data, errors } = props;

  if (errors) {
    return (
      <Layout>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  const site = (data || {}).site;
  const menuItems = site?.navMenu?.items || [];

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo
        title="Volunteer"
        description="Volunteer with BMW CCA Puget Sound Region."
      />
      <ContentContainer
        sx={{
          pl: ["16px", "16px", "50px", "100px"],
          pr: ["16px", "16px", "50px", "100px"],
          pt: ["6.5rem", "6.5rem", "10rem", "10rem"],
          pb: "2rem",
        }}
      >
        <Heading as="h1" sx={{ variant: "styles.h1", pb: "0.75rem" }}>
          Volunteer
          <BoxIcon
            as="span"
            sx={{
              display: "inline-grid",
              ml: "0.5rem",
              verticalAlign: "middle"
            }}
          />
        </Heading>
        <Text sx={{ maxWidth: "44rem" }}>
          We are building this page now. Share how you would like to help and
          we will follow up with current opportunities.
        </Text>
      </ContentContainer>
    </Layout>
  );
};

export default VolunteerPage;
