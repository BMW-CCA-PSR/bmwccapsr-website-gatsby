/** @jsxImportSource theme-ui */
import React from "react";
import { graphql, Link } from "gatsby";
import { Box, Heading, Text } from "@theme-ui/components";
import { FiChevronDown } from "react-icons/fi";
import Layout from "../../containers/layout";
import Seo from "../../components/seo";
import GraphQLErrorList from "../../components/graphql-error-list";
import ContentContainer from "../../components/content-container";
import { BoxIcon } from "../../components/box-icons";
import StylizedLandingHeader from "../../components/stylized-landing-header";
import PermalinkHeading from "../../components/permalink-heading";

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
      accentBg: "#e8f7ec",
      accentColor: "#1f7a3f",
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
      accentBg: "#fff6d5",
      accentColor: "#8b6b00",
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
      accentBg: "#ffe6e6",
      accentColor: "#9a1f1f",
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
      accentBg: "#e6f0ff",
      accentColor: "#2357b3",
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
  const faqs = [
    {
      question: "What is the Rewards Program?",
      answer:
        "It is a structured, point-based program designed to increase volunteer participation, build leadership depth, and reward members who support Chapter events.",
    },
    {
      question: "Who can participate?",
      answer:
        "The program is open to anybody willing to volunteer at 2026 Chapter events.",
    },
    {
      question: "How do I sign up to volunteer?",
      answer: (
        <>
          <Text
            as="span"
            sx={{
              display: "block",
              fontWeight: "heading",
              color: "text",
              mb: "0.35rem",
            }}
          >
            For event-based roles
          </Text>
          <Text as="span" sx={{ display: "block", mb: "0.85rem" }}>
            Most event-based roles handle volunteer registration through MSR.{" "}
            Volunteers must have a MotorsportReg.com profile with valid email
            contact information and register for the designated volunteer event
            listing for each Chapter event. Role descriptions are available on
            the Chapter website{" "}
            <Link
              to="/volunteer/roles"
              sx={{
                color: "primary",
                textDecoration: "none",
                "&:hover": { color: "secondary" },
              }}
            >
              here
            </Link>{" "}
            and within MSR event postings.
          </Text>
          <Text
            as="span"
            sx={{
              display: "block",
              fontWeight: "heading",
              color: "text",
              mb: "0.35rem",
            }}
          >
            For club-based roles
          </Text>
          <Text as="span" sx={{ display: "block" }}>
            Volunteers can apply directly on the Club volunteer listing{" "}
            <Link
              to="/volunteer"
              sx={{
                color: "primary",
                textDecoration: "none",
                "&:hover": { color: "secondary" },
              }}
            >
              here
            </Link>
            . Once the application has been approved, an email confirmation will
            be sent.
          </Text>
        </>
      ),
    },
    {
      question: "What types of volunteer roles are available?",
      answer:
        "Roles range from low commitment, such as parking attendant or event assistant, to leadership positions such as event chairperson, tour leader, and program coordinator. Skill levels are categorized as entry, intermediate, and advanced. Some advanced roles require additional approvals, so review the role descriptions on the Chapter website.",
    },
    {
      question: "How does the points system work?",
      answer:
        "Volunteers earn 1 to 10 points per task depending on responsibility level and required training. Points accumulate throughout the calendar year and determine your recognition tier.",
    },
    {
      question: "What are the recognition tiers?",
      answer: (
        <>
          Each tier offers increasing levels of apparel, recognition, event
          credits, and special benefits. There are four tiers:
          <Box
            as="ul"
            sx={{
              mt: "0.65rem",
              mb: 0,
              pl: "1.15rem",
              listStyleType: "disc",
              lineHeight: 1.7,
            }}
          >
            <Box as="li">Bronze: 1-5 points</Box>
            <Box as="li">Silver: 6-11 points</Box>
            <Box as="li">Gold: 12-19 points</Box>
            <Box as="li">Platinum: 20+ points</Box>
          </Box>
        </>
      ),
    },
    {
      question: "What rewards can I earn?",
      answer:
        "Rewards include Chapter-branded apparel such as hats, shirts, and jackets, volunteer appreciation banquet recognition, premium merchandise, event credits, and eligibility for the grand prize trip to the BMW M Performance Center in Thermal, California.",
    },
    {
      question: "Do instructors earn points?",
      answer:
        "Yes. HPDE and CCC instructors receive points for instructional roles and may earn additional points for volunteer activities outside the instructor program.",
    },
    {
      question: "When does the program start and end?",
      answer:
        "The program launches March 8, 2026. Points accumulate throughout the 2026 calendar year, and tier status resets annually.",
    },
    {
      question: "Why is this program important to the Chapter?",
      answer:
        "Member surveys indicate a desire for more events while recognizing that a small volunteer group currently carries most of the workload. This program builds a sustainable volunteer pipeline, increases event capacity, strengthens community, and supports long-term club viability.",
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
        <StylizedLandingHeader
          word="Volunteer"
          color="secondary"
          bleedTop="65px"
          minHeight="0px"
          topInset={["11rem", "12rem", "15rem", "17rem"]}
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
          rowContents={["VOLUNTEER"]}
        />
        <Box
          sx={{
            position: "relative",
            height: 0,
            mb: 0,
          }}
        >
          <Text
            variant="text.label"
            sx={{
              position: "absolute",
              top: "-1.2rem",
              left: 0,
              zIndex: 2,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
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
                position: "relative",
                zIndex: 3,
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
            sx={{
              variant: "styles.h2",
              mt: "1rem",
              mb: "0.5rem",
              lineHeight: [1.24, 1.2, null, null],
            }}
          >
            <Text
              as="span"
              sx={{ display: ["block", "block", "inline", "inline"] }}
            >
              Your{" "}
              <Box
                as="span"
                sx={{
                  bg: "primary",
                  color: "white",
                  px: ["0.18em", "0.22em", "0.35em", "0.35em"],
                  py: "0.05em",
                  borderRadius: "6px",
                  display: "inline-block",
                  lineHeight: 1.05,
                }}
              >
                Time
              </Box>
              .
            </Text>{" "}
            <Text
              as="span"
              sx={{ display: ["block", "block", "inline", "inline"] }}
            >
              Your{" "}
              <Box
                as="span"
                sx={{
                  bg: "primary",
                  color: "white",
                  px: ["0.18em", "0.22em", "0.35em", "0.35em"],
                  py: "0.05em",
                  borderRadius: "6px",
                  display: "inline-block",
                  lineHeight: 1.05,
                }}
              >
                Impact
              </Box>
              .
            </Text>{" "}
            <Text
              as="span"
              sx={{ display: ["block", "block", "inline", "inline"] }}
            >
              Your{" "}
              <Box
                as="span"
                sx={{
                  bg: "primary",
                  color: "white",
                  px: ["0.18em", "0.22em", "0.35em", "0.35em"],
                  py: "0.05em",
                  borderRadius: "6px",
                  display: "inline-block",
                  lineHeight: 1.05,
                }}
              >
                Rewards
              </Box>
              .
            </Text>
          </Heading>
          <Text
            sx={{
              variant: "styles.p",
              color: "text",
              mb: "1rem",
              fontSize: "16pt",
            }}
          >
            Our Club thrives because of members who step up and get involved.
            The Volunteer Rewards Program is designed to recognize, reward, and
            encourage participation, from helping at a single event to leading
            an entire program. Whether you have an hour to help or want to take
            on a leadership role, your contribution matters.
          </Text>

          <PermalinkHeading
            as="h2"
            id="how-the-program-works"
            linkText="How the Program Works"
            component={Heading}
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            How the Program Works
          </PermalinkHeading>
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

          <PermalinkHeading
            as="h3"
            id="volunteer-point-levels"
            linkText="Volunteer Point Levels"
            component={Heading}
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
          </PermalinkHeading>
          <Box
            sx={{
              mt: "0.75rem",
              mb: "0.5rem",
              border: "1px solid",
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
                  flexDirection: ["row", "row", "row"],
                  gap: ["0.85rem", "1rem", "1rem"],
                  alignItems: ["stretch", "stretch", "center"],
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
                    display: ["flex", "flex", "none", "none"],
                    flex: "0 0 78px",
                    alignSelf: "stretch",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      minHeight: "100%",
                      px: "0.35rem",
                      py: "0.65rem",
                      borderRadius: "16px",
                      backgroundColor: level.accentBg,
                      color: level.accentColor,
                      border: "1px solid",
                      borderColor: "rgba(15,23,42,0.1)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)",
                    }}
                  >
                    <Text
                      as="span"
                      sx={{
                        fontSize: "10px",
                        fontWeight: "heading",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        lineHeight: 1,
                        opacity: 0.8,
                        mb: "0.2rem",
                      }}
                    >
                      Points
                    </Text>
                    <Text
                      as="span"
                      sx={{
                        fontSize: ["34px", "38px"],
                        fontStyle: "italic",
                        fontWeight: "heading",
                        letterSpacing: "-0.04em",
                        lineHeight: 0.84,
                        whiteSpace: "pre-wrap",
                        textAlign: "center",
                      }}
                    >
                      {level.points}
                    </Text>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: ["none", "none", "flex", "flex"],
                    flex: ["0 0 auto", "0 0 auto", "0 0 25%"],
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
                <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
                  <Heading
                    as="h4"
                    sx={{
                      variant: "styles.h4",
                      color: "text",
                      mt: 0,
                      mb: 0,
                      fontSize: ["1.18rem", "1.3rem", "1.45rem", "1.55rem"],
                      lineHeight: [1.08, 1.1, 1.12, 1.12],
                    }}
                  >
                    {level.heading}
                  </Heading>
                  <Text
                    as="strong"
                    sx={{
                      display: "block",
                      mt: "0.35rem",
                      color: "text",
                      fontSize: ["0.95rem", "1rem", null, null],
                      lineHeight: [1.35, 1.4, null, null],
                    }}
                  >
                    {level.lead}
                  </Text>
                  <Box
                    as="ul"
                    sx={{
                      pl: "1.25rem",
                      mt: "0.5rem",
                      lineHeight: [1.45, 1.5, "body"],
                      listStyleType: "disc",
                      fontSize: ["0.92rem", "0.98rem", null, null],
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

          <PermalinkHeading
            as="h2"
            id="eligibility-and-requirements"
            linkText="Eligibility and Requirements"
            component={Heading}
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            Eligibility & Requirements
          </PermalinkHeading>
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

          <Box sx={{ mt: "1.25rem", mb: "0.75rem" }}>
            <PermalinkHeading
              as="h2"
              id="faq"
              linkText="FAQ"
              component={Heading}
              sx={{ variant: "styles.h2", mt: 0, mb: "0.5rem" }}
            >
              FAQ
            </PermalinkHeading>
            <Text sx={{ variant: "styles.p", color: "text", mb: "1rem" }}>
              Common questions about how the volunteer rewards program works.
            </Text>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "black",
                borderRadius: "18px",
                overflow: "hidden",
                bg: "background",
              }}
            >
              {faqs.map((item, index) => (
                <Box
                  as="details"
                  key={item.question}
                  sx={{
                    borderTop: index === 0 ? "none" : "1px solid",
                    borderTopColor: "lightgray",
                    "&[open]": {
                      bg: "#f5f8ff",
                    },
                    "&[open] .faq-icon": {
                      transform: "rotate(180deg)",
                    },
                  }}
                >
                  <Box
                    as="summary"
                    sx={{
                      listStyle: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.85rem",
                      px: ["1rem", "1.25rem"],
                      py: ["0.95rem", "1.1rem"],
                      fontWeight: "heading",
                      fontSize: ["sm", "md"],
                      color: "text",
                      "&::-webkit-details-marker": {
                        display: "none",
                      },
                    }}
                  >
                    <Text as="span" sx={{ color: "inherit", lineHeight: 1.35 }}>
                      {item.question}
                    </Text>
                    <Box
                      as="span"
                      className="faq-icon"
                      sx={{
                        flex: "0 0 auto",
                        width: "34px",
                        height: "34px",
                        borderRadius: "999px",
                        bg: "primary",
                        color: "white",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <FiChevronDown size={18} />
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      px: ["1rem", "1.25rem"],
                      pb: ["1rem", "1.15rem"],
                      pr: ["1rem", "4rem"],
                      color: "text",
                    }}
                  >
                    <Text
                      sx={{
                        variant: "styles.p",
                        mb: 0,
                        color: "inherit",
                        fontSize: "sm",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.answer}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </ContentContainer>
    </Layout>
  );
};

export default VolunteerRewardsPage;
