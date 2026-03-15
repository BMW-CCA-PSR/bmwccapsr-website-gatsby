/** @jsxImportSource theme-ui */
import React from "react";
import { graphql, Link } from "gatsby";
import { Box, Flex, Heading, Text } from "@theme-ui/components";
import {
  FaAward,
  FaBuilding,
  FaCalendarAlt,
  FaTools,
  FaUserPlus,
} from "react-icons/fa";
import Layout from "../../containers/layout";
import Seo from "../../components/seo";
import GraphQLErrorList from "../../components/graphql-error-list";
import ContentContainer from "../../components/content-container";
import { BoxIcon } from "../../components/box-icons";
import StylizedLandingHeader from "../../components/stylized-landing-header";

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
            pb: "0.75rem",
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
              sx={{
                variant: "styles.p",
                color: "text",
                mb: "1rem",
                fontSize: "16pt",
              }}
            >
              Volunteering is how our Club delivers safe, memorable events and
              builds a strong community. From first-time helpers to experienced
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
            Getting Started
          </Heading>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: ["1fr", "1fr", "repeat(2, minmax(0, 1fr))"],
              gap: 0,
              mb: "0.35rem",
            }}
          >
            {[
              {
                title: "Review Roles",
                body: (
                  <>
                    Explore{" "}
                    <Link
                      to="/volunteer"
                      sx={{
                        color: "primary",
                        textDecoration: "none",
                        "&:hover": { color: "secondary" },
                      }}
                    >
                      available volunteer roles and current openings
                    </Link>{" "}
                    to understand where help is needed.
                  </>
                ),
              },
              {
                title: "Choose a Fit",
                body: "Select positions that match your interests, experience level, and availability.",
              },
              {
                title: "Apply or Register",
                body: (
                  <>
                    For event-based roles, volunteer registration is handled
                    through MSR registration*. For club-based roles, apply
                    through the{" "}
                    <Link
                      to="/volunteer"
                      sx={{
                        color: "primary",
                        textDecoration: "none",
                        "&:hover": { color: "secondary" },
                      }}
                    >
                      position listing page
                    </Link>{" "}
                    with your name, email, and optional phone number.
                  </>
                ),
              },
              {
                title: "Show Up Ready",
                body: "Get confirmed, come prepared, and start earning points while supporting the Chapter.",
              },
            ].map((step, index) => {
              const stepNumber = index + 1;
              return (
                <Box
                  key={`getting-started-step-${stepNumber}`}
                  sx={{
                    position: "relative",
                    minHeight: ["148px", "148px", "168px", "176px"],
                    bg: "background",
                    border: "1px solid black",
                    borderRadius: [
                      index === 0
                        ? "18px 18px 0 0"
                        : index === 3
                          ? "0 0 18px 18px"
                          : "0",
                      index === 0
                        ? "18px 18px 0 0"
                        : index === 3
                          ? "0 0 18px 18px"
                          : "0",
                      index === 0
                        ? "18px 0 0 0"
                        : index === 1
                          ? "0 18px 0 0"
                          : index === 2
                            ? "0 0 0 18px"
                            : "0 0 18px 0",
                      index === 0
                        ? "18px 0 0 0"
                        : index === 1
                          ? "0 18px 0 0"
                          : index === 2
                            ? "0 0 0 18px"
                            : "0 0 18px 0",
                    ],
                    mt: [
                      index === 0 ? 0 : "-1px",
                      index === 0 ? 0 : "-1px",
                      index >= 2 ? "-1px" : 0,
                      index >= 2 ? "-1px" : 0,
                    ],
                    ml: [
                      0,
                      0,
                      index % 2 === 1 ? "-1px" : 0,
                      index % 2 === 1 ? "-1px" : 0,
                    ],
                    px: ["1rem", "1rem", "1.2rem", "1.35rem"],
                    py: ["0.8rem", "0.8rem", "0.95rem", "1rem"],
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    zIndex: 0,
                    transition:
                      "background-color 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                    "&:hover": {
                      backgroundColor: "rgba(6, 83, 182, 0.035)",
                      borderColor: "black",
                      boxShadow: "inset 0 0 0 999px rgba(6, 83, 182, 0.02)",
                      zIndex: 2,
                    },
                  }}
                >
                  <Text
                    as="span"
                    sx={{
                      position: "absolute",
                      top: ["-34px", "-38px", "-50px", "-54px"],
                      left: ["-10px", "-10px", "-12px", "-14px"],
                      fontSize: ["340px", "390px", "540px", "560px"],
                      fontStyle: "italic",
                      fontWeight: "heading",
                      lineHeight: 0.82,
                      color: "rgba(6, 83, 182, 0.12)",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {stepNumber}
                  </Text>
                  <Flex
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      width: "100%",
                    }}
                  >
                    <Text
                      as="span"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        transform: "translateY(-50%)",
                        fontSize: ["40pt", "42pt", "44pt", "46pt"],
                        fontWeight: "heading",
                        lineHeight: 1,
                        color: "primary",
                        minWidth: "1ch",
                      }}
                    >
                      {stepNumber}
                    </Text>
                    <Box
                      sx={{
                        minWidth: 0,
                        pl: ["2.8rem", "3rem", "3.2rem", "3.35rem"],
                      }}
                    >
                      <Heading
                        as="h3"
                        sx={{
                          variant: "styles.h3",
                          mt: 0,
                          mb: "0.2rem",
                          fontSize: ["1.2rem", "1.28rem", "1.5rem", "1.6rem"],
                          lineHeight: 1.02,
                        }}
                      >
                        {step.title}
                      </Heading>
                      <Text
                        sx={{
                          variant: "styles.p",
                          mt: 0,
                          mb: 0,
                          fontSize: ["1.02rem", "1.04rem", "1.1rem", "1.12rem"],
                          lineHeight: 1.45,
                        }}
                      >
                        {step.body}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              );
            })}
          </Box>
          <Text
            sx={{
              variant: "styles.p",
              fontSize: "0.9rem",
              color: "darkgray",
              fontStyle: "italic",
              mt: 0,
              mb: "1.25rem",
            }}
          >
            *An active MSR account with a good email attached is required for
            volunteer assignment and attribution.
          </Text>
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
              border: "1px solid",
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
              <Flex
                sx={{
                  display: ["flex", "flex", "none", "none"],
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "1rem",
                  width: "100%",
                }}
              >
                <Box
                  as="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                    p: "0.35rem",
                  }}
                >
                  <FaUserPlus size={42} />
                </Box>
                <Box sx={{ minWidth: 0, textAlign: "left" }}>
                  <Heading
                    as="h3"
                    sx={{
                      variant: "styles.h3",
                      fontSize: ["1.3rem", "1.35rem", null, null],
                      mt: 0,
                      mb: "0.35rem",
                    }}
                  >
                    Entry
                  </Heading>
                  <Text
                    sx={{
                      variant: "styles.p",
                      fontSize: ["0.95rem", "1rem", null, null],
                      mt: 0,
                      mb: 0,
                      textAlign: "left",
                    }}
                  >
                    Great for first-time volunteers
                    <Box as="span" sx={{ display: "block" }}>
                      and limited availability.
                    </Box>
                    <Box
                      as="span"
                      sx={{
                        display: "block",
                        mt: "0.35rem",
                        fontWeight: "heading",
                      }}
                    >
                      Points: 1-2
                    </Box>
                  </Text>
                </Box>
              </Flex>
              <Flex
                sx={{
                  display: ["none", "none", "flex", "flex"],
                  alignItems: "center",
                  gap: "0.65rem",
                }}
              >
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
                  display: ["none", "none", "block", "block"],
                }}
              >
                Great for first-time volunteers
                <Box as="span" sx={{ display: "block" }}>
                  and limited availability.
                </Box>
                <Box
                  as="span"
                  sx={{
                    display: "block",
                    mt: "0.35rem",
                    fontWeight: "heading",
                  }}
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
              <Flex
                sx={{
                  display: ["flex", "flex", "none", "none"],
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "1rem",
                  width: "100%",
                }}
              >
                <Box
                  as="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                    p: "0.35rem",
                  }}
                >
                  <FaTools size={42} />
                </Box>
                <Box sx={{ minWidth: 0, textAlign: "left" }}>
                  <Heading
                    as="h3"
                    sx={{
                      variant: "styles.h3",
                      fontSize: ["1.3rem", "1.35rem", null, null],
                      mt: 0,
                      mb: "0.35rem",
                    }}
                  >
                    Intermediate
                  </Heading>
                  <Text
                    sx={{
                      variant: "styles.p",
                      fontSize: ["0.95rem", "1rem", null, null],
                      mt: 0,
                      mb: 0,
                      textAlign: "left",
                    }}
                  >
                    Ideal for members ready
                    <Box as="span" sx={{ display: "block" }}>
                      to take on more responsibility.
                    </Box>
                    <Box
                      as="span"
                      sx={{
                        display: "block",
                        mt: "0.35rem",
                        fontWeight: "heading",
                      }}
                    >
                      Points: 3-4
                    </Box>
                  </Text>
                </Box>
              </Flex>
              <Flex
                sx={{
                  display: ["none", "none", "flex", "flex"],
                  alignItems: "center",
                  gap: "0.65rem",
                }}
              >
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
                  display: ["none", "none", "block", "block"],
                }}
              >
                Ideal for members ready
                <Box as="span" sx={{ display: "block" }}>
                  to take on more responsibility.
                </Box>
                <Box
                  as="span"
                  sx={{
                    display: "block",
                    mt: "0.35rem",
                    fontWeight: "heading",
                  }}
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
              <Flex
                sx={{
                  display: ["flex", "flex", "none", "none"],
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "1rem",
                  width: "100%",
                }}
              >
                <Box
                  as="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                    p: "0.35rem",
                  }}
                >
                  <FaAward size={42} />
                </Box>
                <Box sx={{ minWidth: 0, textAlign: "left" }}>
                  <Heading
                    as="h3"
                    sx={{
                      variant: "styles.h3",
                      fontSize: ["1.3rem", "1.35rem", null, null],
                      mt: 0,
                      mb: "0.35rem",
                    }}
                  >
                    Advanced
                  </Heading>
                  <Text
                    sx={{
                      variant: "styles.p",
                      fontSize: ["0.95rem", "1rem", null, null],
                      mt: 0,
                      mb: 0,
                      textAlign: "left",
                    }}
                  >
                    Best for experienced volunteers
                    <Box as="span" sx={{ display: "block" }}>
                      with specialized skills.
                    </Box>
                    <Box
                      as="span"
                      sx={{
                        display: "block",
                        mt: "0.35rem",
                        fontWeight: "heading",
                      }}
                    >
                      Points: 5 or 10
                    </Box>
                  </Text>
                </Box>
              </Flex>
              <Flex
                sx={{
                  display: ["none", "none", "flex", "flex"],
                  alignItems: "center",
                  gap: "0.65rem",
                }}
              >
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
                  display: ["none", "none", "block", "block"],
                }}
              >
                Best for experienced volunteers
                <Box as="span" sx={{ display: "block" }}>
                  with specialized skills.
                </Box>
                <Box
                  as="span"
                  sx={{
                    display: "block",
                    mt: "0.35rem",
                    fontWeight: "heading",
                  }}
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
            . Point allocation may be adjusted at the discretion of the Board or
            Volunteer Program Chair when deemed necessary.
          </Text>

          <Heading
            as="h2"
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            Role Scope
          </Heading>
          <Text sx={{ variant: "styles.p", mb: "0.75rem" }}>
            The Club is seeking volunteers for both event-based and club-based
            roles. Some opportunities support a specific event date, while
            others help the Club operate year-round across programs,
            communications, planning, and member services.
          </Text>
          <Text sx={{ variant: "styles.p", mb: "1.5rem" }}>
            Event-based roles are often a great entry point for new volunteers,
            while club-based roles can offer more continuity, ownership, and
            long-term impact across the Chapter.
          </Text>
          <Box
            sx={{
              mt: "1.25rem",
              border: "1px solid",
              borderColor: "black",
              borderRadius: "18px",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: ["1fr", "1fr", "repeat(2, minmax(0, 1fr))"],
              mb: "1.75rem",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#e6f0ff",
                p: ["1.25rem", "1.25rem", "1.75rem", "2rem"],
                minHeight: ["auto", "auto", "180px", "200px"],
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "#dce9ff",
                },
              }}
            >
              <Flex sx={{ alignItems: "center", gap: "0.65rem" }}>
                <FaCalendarAlt size={32} />
                <Heading
                  as="h3"
                  sx={{
                    variant: "styles.h3",
                    fontSize: ["1.3rem", "1.35rem", "1.6rem", "1.75rem"],
                    my: 0,
                  }}
                >
                  Event-Based Roles
                </Heading>
              </Flex>
              <Text
                sx={{
                  variant: "styles.p",
                  fontSize: ["0.95rem", "1rem", "1.05rem", "1.05rem"],
                  mt: "0.5rem",
                }}
              >
                Roles tied to a specific event date or weekend.
                <Box
                  as="ul"
                  sx={{
                    mt: "0.45rem",
                    mb: 0,
                    pl: "1.15rem",
                    listStyleType: "disc",
                    lineHeight: 1.6,
                  }}
                >
                  <Box as="li">Parking attendant</Box>
                  <Box as="li">Event assistant</Box>
                  <Box as="li">Tour sweeper or tour leader</Box>
                  <Box as="li">Event chairperson support</Box>
                </Box>
              </Text>
            </Box>
            <Box
              sx={{
                borderLeft: ["none", "none", "1px solid", "1px solid"],
                borderLeftColor: "black",
                borderTop: ["1px solid", "1px solid", "none", "none"],
                borderTopColor: "black",
                backgroundColor: "#eef3f5",
                p: ["1.25rem", "1.25rem", "1.75rem", "2rem"],
                minHeight: ["auto", "auto", "180px", "200px"],
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: "#e6edf0",
                },
              }}
            >
              <Flex sx={{ alignItems: "center", gap: "0.65rem" }}>
                <FaBuilding size={32} />
                <Heading
                  as="h3"
                  sx={{
                    variant: "styles.h3",
                    fontSize: ["1.3rem", "1.35rem", "1.6rem", "1.75rem"],
                    my: 0,
                  }}
                >
                  Club-Based Roles
                </Heading>
              </Flex>
              <Text
                sx={{
                  variant: "styles.p",
                  fontSize: ["0.95rem", "1rem", "1.05rem", "1.05rem"],
                  mt: "0.5rem",
                }}
              >
                Ongoing roles that support the Chapter beyond a single event.
                <Box
                  as="ul"
                  sx={{
                    mt: "0.45rem",
                    mb: 0,
                    pl: "1.15rem",
                    listStyleType: "disc",
                    lineHeight: 1.6,
                  }}
                >
                  <Box as="li">Program coordinator</Box>
                  <Box as="li">Volunteer coordinator</Box>
                  <Box as="li">Communications support</Box>
                  <Box as="li">Webmaster or board support</Box>
                </Box>
              </Text>
            </Box>
          </Box>

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
              Earn recognition and rewards.
            </Box>
            <Box as="li" sx={{ mb: "0.5rem" }}>
              Help ensure the long-term success of the Club.
            </Box>
          </Box>
        </Box>
      </ContentContainer>
    </Layout>
  );
};

export default VolunteerOverviewPage;
