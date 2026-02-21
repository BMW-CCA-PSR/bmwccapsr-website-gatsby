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
  query TermsOfUsePageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
      _rawTermsOfUse(resolveReferences: { maxDepth: 10 })
    }
  }
`;

const TermsOfUsePage = (props) => {
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
  const termsBody = site?._rawTermsOfUse || [];

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo title="Terms of Use" />
      <ContentContainer
        sx={{
          pl: ["16px", "16px", "50px", "100px"],
          pr: ["16px", "16px", "50px", "100px"],
          pt: ["6.5rem", "6.5rem", "10rem", "10rem"],
          pb: "2rem",
        }}
      >
        <Heading as="h1" sx={{ variant: "styles.h1", pb: "0.75rem" }}>
          Terms of Use
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
          {termsBody.length > 0 ? (
            <PortableText body={termsBody} boxed />
          ) : (
            <Text sx={{ color: "darkgray" }}>
              Terms of Use content has not been added yet.
            </Text>
          )}
        </Box>
      </ContentContainer>
    </Layout>
  );
};

export default TermsOfUsePage;
