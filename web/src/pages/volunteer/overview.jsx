/** @jsxImportSource theme-ui */
import React from "react";
import { graphql, Link } from "gatsby";
import { Box, Flex, Heading, Text } from "@theme-ui/components";
import { FiArrowDownRight, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import Layout from "../../containers/layout";
import Seo from "../../components/seo";
import GraphQLErrorList from "../../components/graphql-error-list";
import ContentContainer from "../../components/content-container";
import { BoxIcon } from "../../components/box-icons";

export const query = graphql`
  query VolunteerOverviewPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
  }
`;

const VolunteerOverviewPage = ({ data, errors }) => {
  const site = data?.site;
  const menuItems = site?.navMenu?.items || [];

  if (errors) {
    return (
      <Layout navMenuItems={menuItems}>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo title="Volunteering Overview" />
      <ContentContainer
        sx={{
          pl: ["16px", "16px", "50px", "100px"],
          pr: ["16px", "16px", "50px", "100px"],
          pt: ["6.5rem", "6.5rem", "10rem", "10rem"],
          pb: "2rem",
        }}
      >
        <Text variant="text.label">
          <Link
            to="/volunteer"
            sx={{
              textDecoration: "none",
              color: "text",
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              px: "0.15em",
              mx: "-0.15em"
            }}
          >
            Volunteer
          </Link>
          <Text as="span" sx={{ px: "0.35em" }}>
            /
          </Text>
          Overview
        </Text>
        <Heading as="h1" sx={{ variant: "styles.h1", mt: "1rem", mb: "0.75rem" }}>
          Volunteering Overview
          <BoxIcon
            as="span"
            sx={{
              display: "inline-grid",
              ml: "0.5rem",
              verticalAlign: "middle"
            }}
          />
        </Heading>
        <Box sx={{ maxWidth: "900px" }}>
          <Text sx={{ variant: "styles.p", color: "text", mb: "1rem" }}>
            Volunteering is how PSR delivers safe, memorable events and builds a
            strong community. From first-time helpers to experienced leaders,
            there are roles matched to your time, interests, and skill level.
            Use this overview to understand how roles are structured and how to
            get started.
          </Text>

          <Heading as="h2" sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}>
            Skill Level Guide
          </Heading>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "lightgray",
              borderRadius: "16px",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: ["1fr", "1fr", "repeat(3, minmax(0, 1fr))"],
              mb: "1.5rem"
            }}
          >
            <Box
              sx={{
                backgroundColor: "#e8f7ec",
                p: "1rem"
              }}
            >
              <Flex sx={{ alignItems: "center", gap: "0.5rem" }}>
                <FiArrowDownRight size={18} />
                <Text sx={{ fontWeight: "heading" }}>Entry</Text>
              </Flex>
              <Text sx={{ variant: "styles.p", mt: "0.35rem" }}>
                Great for first-time volunteers
                <Box as="span" sx={{ display: "block" }}>
                  and limited availability.
                </Box>
              </Text>
            </Box>
            <Box
              sx={{
                borderLeft: "1px solid",
                borderLeftColor: "lightgray",
                backgroundColor: "#fff6d5",
                p: "1rem"
              }}
            >
              <Flex sx={{ alignItems: "center", gap: "0.5rem" }}>
                <FiArrowRight size={18} />
                <Text sx={{ fontWeight: "heading" }}>Medium</Text>
              </Flex>
              <Text sx={{ variant: "styles.p", mt: "0.35rem" }}>
                Ideal for members ready
                <Box as="span" sx={{ display: "block" }}>
                  to take on more responsibility.
                </Box>
              </Text>
            </Box>
            <Box
              sx={{
                borderLeft: "1px solid",
                borderLeftColor: "lightgray",
                backgroundColor: "#ffe6e6",
                p: "1rem"
              }}
            >
              <Flex sx={{ alignItems: "center", gap: "0.5rem" }}>
                <FiArrowUpRight size={18} />
                <Text sx={{ fontWeight: "heading" }}>Hard</Text>
              </Flex>
              <Text sx={{ variant: "styles.p", mt: "0.35rem" }}>
                Best for experienced volunteers
                <Box as="span" sx={{ display: "block" }}>
                  with specialized skills.
                </Box>
              </Text>
            </Box>
          </Box>

          <Heading as="h3" sx={{ variant: "styles.h3", mt: "1.25rem", mb: "0.5rem" }}>
            Why Volunteer?
          </Heading>
          <Box
            as="ul"
            sx={{
              pl: "1.25rem",
              mb: "1rem",
              lineHeight: "body",
              listStyleType: "disc"
            }}
          >
            <Box as="li" sx={{ mb: "0.5rem" }}>
              Support the Club community you enjoy and have fun!
            </Box>
            <Box as="li" sx={{ mb: "0.5rem" }}>
              Meet fellow enthusiasts and build lasting connections.
            </Box>
            <Box as="li" sx={{ mb: "0.5rem" }}>
              Develop leadership and event-management skills.
            </Box>
            <Box as="li" sx={{ mb: "0.5rem" }}>
              Earn recognition and rewards.
            </Box>
            <Box as="li" sx={{ mb: "0.5rem" }}>
              Help ensure the long-term success of the Club.
            </Box>
          </Box>

          <Heading as="h3" sx={{ variant: "styles.h3", mt: "1.25rem", mb: "0.5rem" }}>
            Getting Started
          </Heading>
          <Box
            as="ol"
            sx={{
              pl: "1.25rem",
              mb: "1rem",
              lineHeight: "body",
              listStyleType: "decimal"
            }}
          >
            <Box as="li" sx={{ mb: "0.5rem" }}>
              Review available volunteer opportunities.
            </Box>
            <Box as="li" sx={{ mb: "0.5rem" }}>
              Select a role that matches your interests and availability.
            </Box>
            <Box as="li" sx={{ mb: "0.5rem" }}>
              Sign up or contact the Volunteer Coordinator.
            </Box>
            <Box as="li" sx={{ mb: "0.5rem" }}>
              Earn points and make a difference!
            </Box>
          </Box>
        </Box>
      </ContentContainer>
    </Layout>
  );
};

export default VolunteerOverviewPage;
