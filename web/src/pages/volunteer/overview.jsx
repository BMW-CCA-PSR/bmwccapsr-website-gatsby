/** @jsxImportSource theme-ui */
import React from "react";
import { graphql, Link } from "gatsby";
import { Box, Flex, Heading, Text } from "@theme-ui/components";
import { FaAward, FaTools, FaUserPlus } from "react-icons/fa";
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
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            mb: "0.5rem",
            width: "fit-content",
          }}
        >
          <Text variant="text.label" sx={{ display: "inline-block" }}>
            <Link
              to="/volunteer"
              sx={{
                textDecoration: "none",
                color: "text",
                display: "inline-flex",
                alignItems: "center",
                cursor: "pointer",
                px: "0.15em",
                mx: "-0.15em",
              }}
            >
              Volunteer
            </Link>
            <Text as="span" sx={{ px: "0.35em" }}>
              /
            </Text>
            Overview
          </Text>
        </Box>
        <Flex
          sx={{
            flexDirection: ["column", "column", "row", "row"],
            alignItems: [
              "flex-start",
              "flex-start",
              "flex-start",
              "flex-start",
            ],
            justifyContent: "space-between",
            gap: ["1rem", "1rem", "2.5rem", "2.5rem"],
          }}
        >
          <Box sx={{ flex: "1 1 auto", minWidth: 0, maxWidth: "900px" }}>
            <Heading
              as="h1"
              sx={{
                variant: "styles.h1",
                mt: 0,
                mb: "0.75rem",
                position: "relative",
                zIndex: 1,
              }}
            >
              Volunteering Overview
              <BoxIcon
                as="span"
                sx={{
                  display: "inline-grid",
                  ml: "0.5rem",
                  verticalAlign: "middle",
                }}
              />
            </Heading>
            <Text
              sx={{ variant: "styles.p", color: "text", mb: "1rem", fontSize: "16pt" }}
            >
              Volunteering is how PSR delivers safe, memorable events and builds
              a strong community. From first-time helpers to experienced
              leaders, there are roles matched to your time, interests, and
              skill level. Use this overview to understand how roles are
              structured and how to get started.
            </Text>
          </Box>
          <Box
            as="img"
            src="/images/volunteer3.png"
            alt="Volunteers supporting BMW CCA events"
            sx={{
              width: ["100%", "100%", "320px", "360px"],
              height: ["280px", "320px", "280px", "300px"],
              objectFit: "cover",
              objectPosition: "center 82%",
              borderRadius: "18px",
              flex: "0 0 auto",
            }}
          />
        </Flex>
        <Box>
          <Heading
            as="h2"
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            Skill Level Guide
          </Heading>
          <Text sx={{ variant: "styles.p", mb: "1.5rem" }}>
            Points are tied first to expected time and effort, and second to the
            role/skill level. Higher point values generally mean a larger
            responsibility and more effort.
          </Text>
          <Box
            sx={{
              mt: "1.25rem",
              border: "2px solid",
              borderColor: "black",
              borderRadius: "18px",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: ["1fr", "1fr", "repeat(3, minmax(0, 1fr))"],
              mb: "1.75rem",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#e8f7ec",
                p: ["1.25rem", "1.25rem", "1.75rem", "2rem"],
                minHeight: ["auto", "auto", "180px", "200px"],
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "#d4f1dd",
                },
              }}
            >
              <Flex sx={{ alignItems: "center", gap: "0.65rem" }}>
                <FaUserPlus size={32} />
                <Heading
                  as="h3"
                  sx={{
                    variant: "styles.h3",
                    fontSize: ["1.3rem", "1.35rem", "1.6rem", "1.75rem"],
                    my: 0,
                  }}
                >
                  Entry
                </Heading>
              </Flex>
              <Text
                sx={{
                  variant: "styles.p",
                  fontSize: ["0.95rem", "1rem", "1.05rem", "1.05rem"],
                  mt: "0.5rem",
                }}
              >
                Great for first-time volunteers
                <Box as="span" sx={{ display: "block" }}>
                  and limited availability.
                </Box>
                <Box
                  as="span"
                  sx={{ display: "block", mt: "0.35rem", fontWeight: "heading" }}
                >
                  Points: 1-2
                </Box>
              </Text>
            </Box>
            <Box
              sx={{
                borderLeft: ["none", "none", "2px solid", "2px solid"],
                borderLeftColor: "black",
                borderTop: ["2px solid", "2px solid", "none", "none"],
                borderTopColor: "black",
                backgroundColor: "#fff6d5",
                p: ["1.25rem", "1.25rem", "1.75rem", "2rem"],
                minHeight: ["auto", "auto", "180px", "200px"],
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "#ffe9a6",
                },
              }}
            >
              <Flex sx={{ alignItems: "center", gap: "0.65rem" }}>
                <FaTools size={32} />
                <Heading
                  as="h3"
                  sx={{
                    variant: "styles.h3",
                    fontSize: ["1.3rem", "1.35rem", "1.6rem", "1.75rem"],
                    my: 0,
                  }}
                >
                  Intermediate
                </Heading>
              </Flex>
              <Text
                sx={{
                  variant: "styles.p",
                  fontSize: ["0.95rem", "1rem", "1.05rem", "1.05rem"],
                  mt: "0.5rem",
                }}
              >
                Ideal for members ready
                <Box as="span" sx={{ display: "block" }}>
                  to take on more responsibility.
                </Box>
                <Box
                  as="span"
                  sx={{ display: "block", mt: "0.35rem", fontWeight: "heading" }}
                >
                  Points: 3-4
                </Box>
              </Text>
            </Box>
            <Box
              sx={{
                borderLeft: ["none", "none", "2px solid", "2px solid"],
                borderLeftColor: "black",
                borderTop: ["2px solid", "2px solid", "none", "none"],
                borderTopColor: "black",
                backgroundColor: "#ffe6e6",
                p: ["1.25rem", "1.25rem", "1.75rem", "2rem"],
                minHeight: ["auto", "auto", "180px", "200px"],
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "#ffd1d1",
                },
              }}
            >
              <Flex sx={{ alignItems: "center", gap: "0.65rem" }}>
                <FaAward size={32} />
                <Heading
                  as="h3"
                  sx={{
                    variant: "styles.h3",
                    fontSize: ["1.3rem", "1.35rem", "1.6rem", "1.75rem"],
                    my: 0,
                  }}
                >
                  Advanced
                </Heading>
              </Flex>
              <Text
                sx={{
                  variant: "styles.p",
                  fontSize: ["0.95rem", "1rem", "1.05rem", "1.05rem"],
                  mt: "0.5rem",
                }}
              >
                Best for experienced volunteers
                <Box as="span" sx={{ display: "block" }}>
                  with specialized skills.
                </Box>
                <Box
                  as="span"
                  sx={{ display: "block", mt: "0.35rem", fontWeight: "heading" }}
                >
                  Points: 5 or 10
                </Box>
              </Text>
            </Box>
          </Box>
          <Text sx={{ variant: "styles.p", mb: "0.75rem" }}>
            Points also tie directly into the Volunteer Rewards Program. Learn
            how points are tracked and redeemed in the{" "}
            <Link
              to="/volunteer/rewards"
              sx={{ color: "primary", textDecoration: "none" }}
            >
              Rewards Program
            </Link>
            .
          </Text>

          <Heading
            as="h2"
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            Why Volunteer?
          </Heading>
          <Box
            as="ul"
            sx={{
              pl: "1.25rem",
              mb: "1rem",
              lineHeight: "body",
              listStyleType: "disc",
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

          <Heading
            as="h2"
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            Getting Started
          </Heading>
          <Box
            as="ol"
            sx={{
              pl: "1.25rem",
              mb: "1rem",
              lineHeight: "body",
              listStyleType: "decimal",
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
