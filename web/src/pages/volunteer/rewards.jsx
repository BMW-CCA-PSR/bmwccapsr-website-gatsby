/** @jsxImportSource theme-ui */
import React from "react";
import { graphql, Link } from "gatsby";
import { Box, Heading, Text } from "@theme-ui/components";
import Layout from "../../containers/layout";
import Seo from "../../components/seo";
import GraphQLErrorList from "../../components/graphql-error-list";
import ContentContainer from "../../components/content-container";
import { BoxIcon } from "../../components/box-icons";

export const query = graphql`
  query VolunteerRewardsPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
  }
`;

const VolunteerRewardsPage = ({ data, errors }) => {
  const site = data?.site;
  const menuItems = site?.navMenu?.items || [];
  const pointLevels = [
    {
      points: "1   \n2",
      heading: "Event Support Roles",
      lead: "Ideal for first-time volunteers or members with limited availability.",
      bullets: [
        "Event set-up or clean-up",
        "Parking cars",
        "Resetting cones at a Car Control Clinic",
        "Capturing event photos or video",
        "Assisting with food and beverages",
        "Supporting music, logistics, or general event operations",
        "Typically short in duration and require minimal training",
      ],
    },
    {
      points: "3   \n4",
      heading: "Operational & Event Leadership",
      lead: "For members interested in taking on increased responsibility.",
      bullets: [
        "Managing merchandise or membership tables",
        "Collecting entry fees or verifying membership",
        "Serving as a tour sweeper or tour leader",
        "Organizing social, technical, or driving tour events",
        "Writing articles for Z-Mail or BimmerLife",
        "May require prior experience, training, or coordination with event leadership",
      ],
    },
    {
      points: "5",
      heading: "Specialized & Certified Roles",
      lead: "Designed for members with specialized expertise or formal certification.",
      bullets: [
        "Car Control Clinic (CCC) or High-Performance Driving Education (HPDE) Instructor",
        "Graphic Designer",
        "Event Co-Chair",
        "Advanced preparation, credentialing, or unique skill sets required",
      ],
    },
    {
      points: "10",
      heading: "Ongoing Leadership Roles",
      lead: "For members who provide sustained leadership and accountability throughout the year.",
      bullets: [
        "Membership Chair",
        "Volunteer Coordinator",
        "Marketing Coordinator",
        "Tour, Social, or Tech Event Chair",
        "Club Partner or Sponsor Coordinator",
        "Often involves Board collaboration and year-long commitment",
      ],
    },
  ];

  if (errors) {
    return (
      <Layout navMenuItems={menuItems}>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo title="Volunteer Rewards Program" />
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
              VOLUNTEER
            </Link>
            <Text as="span" sx={{ px: "0.35em" }}>
              /
            </Text>
            REWARDS
          </Text>
        </Box>
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
          Volunteer Rewards Program
          <BoxIcon
            as="span"
            sx={{
              display: "inline-grid",
              ml: "0.5rem",
              verticalAlign: "middle",
            }}
          />
        </Heading>
        <Box>
          <Heading
            as="h2"
            sx={{ variant: "styles.h2", mt: "1rem", mb: "0.5rem" }}
          >
            Your{" "}
            <Box
              as="span"
              sx={{
                bg: "primary",
                color: "white",
                px: "0.35em",
                py: "0.05em",
                borderRadius: "6px",
                display: "inline-block",
                lineHeight: 1.05,
              }}
            >
              Time
            </Box>
            . Your{" "}
            <Box
              as="span"
              sx={{
                bg: "primary",
                color: "white",
                px: "0.35em",
                py: "0.05em",
                borderRadius: "6px",
                display: "inline-block",
                lineHeight: 1.05,
              }}
            >
              Impact
            </Box>
            . Your{" "}
            <Box
              as="span"
              sx={{
                bg: "primary",
                color: "white",
                px: "0.35em",
                py: "0.05em",
                borderRadius: "6px",
                display: "inline-block",
                lineHeight: 1.05,
              }}
            >
              Rewards
            </Box>
            .
          </Heading>
          <Text
              sx={{ variant: "styles.p", color: "text", mb: "1rem", fontSize: "16pt" }}
            >
            Our Club thrives because of members who step up and get involved.
            The Volunteer Rewards Program is designed to recognize, reward, and
            encourage participation, from helping at a single event to leading
            an entire program. Whether you have an hour to help or want to take
            on a leadership role, your contribution matters.
          </Text>

          <Heading
            as="h2"
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            How the Program Works
          </Heading>
          <Text sx={{ variant: "styles.p", color: "text", mb: "1rem" }}>
            Members earn Volunteer Points by supporting Club activities. Points
            are awarded based on the skill level, responsibility, and time
            commitment of each volunteer role. Points accumulate throughout the
            year and may be redeemed for recognition, rewards, and special
            benefits, as defined by the PSR Board. Role information and
            descriptions can be found{" "}
            <Link
              to="/volunteer/roles"
              sx={{
                color: "primary",
                textDecoration: "none",
                "&:hover": { color: "secondary" },
              }}
            >
              here
            </Link>
            .
          </Text>

          <Heading
            as="h3"
            sx={{ variant: "styles.h3", mt: "1.25rem", mb: "0.5rem" }}
          >
            Volunteer Point Levels
            <Text
              as="span"
              sx={{
                fontSize: "0.62em",
                verticalAlign: "super",
                ml: "0.16em",
                color: "darkgray",
                fontStyle: "italic",
                lineHeight: 1,
              }}
            >
              *
            </Text>
          </Heading>
          <Box
            sx={{
              mt: "0.75rem",
              mb: "0.5rem",
              border: "2px solid",
              borderColor: "black",
              borderRadius: "18px",
              overflow: "hidden",
              backgroundColor: "background",
            }}
          >
            {pointLevels.map((level, index) => (
              <Box
                key={level.heading}
                sx={{
                  display: "flex",
                  flexDirection: ["column", "row"],
                  gap: "1rem",
                  alignItems: ["flex-start", "center"],
                  px: ["1rem", "1.25rem"],
                  py: ["1rem", "1.25rem"],
                  borderTop: index === 0 ? "none" : "1px solid",
                  borderTopColor: "lightgray",
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f5f8ff",
                    ".point-value": {
                      opacity: 1,
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    flex: ["0 0 auto", "0 0 25%"],
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    minHeight: ["90px", "100%", "100%"],
                    px: ["0.5rem", "0.75rem"],
                  }}
                >
                  <Text
                    as="span"
                    className="point-value"
                    sx={{
                      fontSize: ["88px", "112px", "160px"],
                      fontStyle: "italic",
                      fontWeight: "heading",
                      letterSpacing: "-0.03em",
                      lineHeight: 0.9,
                      whiteSpace: "pre-wrap",
                      color: "primary",
                      opacity: 0.24,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    {level.points}
                  </Text>
                </Box>
                <Box>
                  <Heading
                    as="h4"
                    sx={{
                      variant: "styles.h4",
                      color: "text",
                      mt: 0,
                      mb: 0,
                    }}
                  >
                    {level.heading}
                  </Heading>
                  <Text
                    as="strong"
                    sx={{ display: "block", mt: "0.35rem", color: "text" }}
                  >
                    {level.lead}
                  </Text>
                  <Box
                    as="ul"
                    sx={{
                      pl: "1.25rem",
                      mt: "0.5rem",
                      lineHeight: "body",
                      listStyleType: "disc",
                    }}
                  >
                    {level.bullets.map((item) => (
                      <Box as="li" key={item} sx={{ mb: "0.35rem" }}>
                        {item}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.35rem",
              color: "darkgray",
              mt: "-0.35rem",
              mb: "1.25rem",
            }}
          >
            <Text
              as="span"
              aria-hidden="true"
              sx={{
                flex: "0 0 auto",
                mt: "0.12rem",
                fontSize: "11px",
                lineHeight: 1,
                color: "darkgray",
                fontStyle: "italic",
              }}
            >
              *
            </Text>
            <Text
              sx={{
                variant: "styles.p",
                fontSize: "xxs",
                fontStyle: "italic",
                color: "inherit",
                mb: 0,
              }}
            >
              Please note: point allocation may be adjusted at the discretion of
              the Board or Volunteer Program Chair when deemed necessary.
            </Text>
          </Box>

          <Heading
            as="h2"
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            Eligibility & Requirements
          </Heading>
          <Box
            as="ul"
            sx={{
              pl: "1.25rem",
              mb: "0.5rem",
              lineHeight: "body",
              listStyleType: "disc",
            }}
          >
            <Box as="li" sx={{ mb: "0.5rem" }}>
              <Text as="strong">Active Club membership</Text>
              <Text as="span"> is required for participation.</Text>
            </Box>
            <Box as="li" sx={{ mb: "0.5rem" }}>
              <Text as="strong">Training, certification, or experience</Text>
              <Text as="span"> may be required for certain positions.</Text>
            </Box>
            <Box as="li" sx={{ mb: "0.5rem" }}>
              <Text as="strong">Leadership roles</Text>
              <Text as="span"> may require Board appointment or approval.</Text>
            </Box>
            <Box as="li" sx={{ mb: "0.5rem" }}>
              <Text as="strong">Points are awarded</Text>
              <Text as="span">
                {" "}
                per event or per term, depending on the role.
              </Text>
            </Box>
          </Box>
          <Text sx={{ variant: "styles.p", color: "text", mb: "1rem" }}>
            All requirements are communicated clearly before volunteering.
          </Text>
        </Box>
      </ContentContainer>
    </Layout>
  );
};

export default VolunteerRewardsPage;
