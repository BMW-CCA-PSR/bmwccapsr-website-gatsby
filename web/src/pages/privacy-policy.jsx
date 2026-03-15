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
import StylizedLandingHeader from "../components/stylized-landing-header";

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
        <StylizedLandingHeader
          word="Privacy Policy"
          color="gray"
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
          rowContents={["PRIVACY POLICY"]}
        />
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
