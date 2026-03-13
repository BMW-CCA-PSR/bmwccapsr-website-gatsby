/** @jsxImportSource theme-ui */
import React from "react";
import { graphql } from "gatsby";
import { Box, Heading, Text } from "@theme-ui/components";
import GraphQLErrorList from "../components/graphql-error-list";
import Seo from "../components/seo";
import Layout from "../containers/layout";
import ContentContainer from "../components/content-container";
import PortableText from "../components/portableText";
import { BoxIcon } from "../components/box-icons";

export const query = graphql`
  query PrivacyPolicyPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
      _rawPrivacyPolicy(resolveReferences: { maxDepth: 10 })
    }
  }
`;

const PrivacyPolicyPage = (props) => {
  const { data, errors } = props;

  if (errors) {
    return (
      <Layout>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  const site = data?.site;
  const menuItems = site?.navMenu?.items || [];
  const policyBody = site?._rawPrivacyPolicy || [];

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo title="Privacy Policy" />
      <ContentContainer
        sx={{
          pl: ["16px", "16px", "50px", "100px"],
          pr: ["16px", "16px", "50px", "100px"],
          pt: ["6.5rem", "6.5rem", "10rem", "10rem"],
          pb: "2rem",
        }}
      >
        <Heading as="h1" sx={{ variant: "styles.h1", pb: "0.75rem" }}>
          Privacy Policy
          <BoxIcon
            as="span"
            sx={{
              display: "inline-grid",
              ml: "0.5rem",
              verticalAlign: "middle",
            }}
          />
        </Heading>
        <Box
          sx={{
            borderTop: "3px solid",
            borderColor: "text",
            pt: "1rem",
          }}
        >
          {policyBody.length > 0 ? (
            <PortableText body={policyBody} boxed />
          ) : (
            <Text sx={{ color: "darkgray" }}>
              Privacy Policy content has not been added yet.
            </Text>
          )}
        </Box>
      </ContentContainer>
    </Layout>
  );
};

export default PrivacyPolicyPage;
