/** @jsxImportSource theme-ui */
import React from "react";
import { graphql, Link } from "gatsby";
import { Box, Flex, Heading, Text } from "@theme-ui/components";
import SanityImage from "gatsby-plugin-sanity-image";
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
import PermalinkHeading from "../../components/permalink-heading";
import PortableText from "../../components/portableText";

export const query = graphql`
  query VolunteerOverviewPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    overviewSettings: sanityVolunteerOverviewPageSettings(
      _id: { regex: "/(drafts.|)volunteerOverviewPageSettings/" }
    ) {
      overviewImage {
        ...SanityImage
      }
      _rawSubheader(resolveReferences: { maxDepth: 5 })
      gettingStartedCards {
        title
        _rawBody(resolveReferences: { maxDepth: 5 })
      }
      skillLevelCards {
        title
        _rawBody(resolveReferences: { maxDepth: 5 })
      }
      _rawRoleScopeBody(resolveReferences: { maxDepth: 5 })
      roleScopeCards {
        title
        _rawBody(resolveReferences: { maxDepth: 5 })
      }
      _rawWhyVolunteerBody(resolveReferences: { maxDepth: 5 })
    }
  }
`;

const renderPortableText = (body, boxedSx) =>
  Array.isArray(body) && body.length > 0 ? (
    <PortableText body={body} boxedSx={boxedSx} />
  ) : null;

const VolunteerOverviewPage = ({ data, errors }) => {
  const site = data?.site;
  const overviewSettings = data?.overviewSettings;
  const menuItems = site?.navMenu?.items || [];
  const overviewImage = overviewSettings?.overviewImage;
  const overviewSubheader = overviewSettings?._rawSubheader;
  const gettingStartedSteps = Array.isArray(overviewSettings?.gettingStartedCards)
    ? overviewSettings.gettingStartedCards.map((card, index) => ({
        title: card?.title || `Step ${index + 1}`,
        body: card?._rawBody || [],
      }))
    : [];
  const skillLevelCards = Array.isArray(overviewSettings?.skillLevelCards)
    ? overviewSettings.skillLevelCards.map((card, index) => ({
        title: card?.title || `Skill level ${index + 1}`,
        body: card?._rawBody || [],
      }))
    : [];
  const roleScopeBody = overviewSettings?._rawRoleScopeBody || [];
  const roleScopeCards = Array.isArray(overviewSettings?.roleScopeCards)
    ? overviewSettings.roleScopeCards.map((card, index) => ({
        title: card?.title || `Role scope ${index + 1}`,
        body: card?._rawBody || [],
      }))
    : [];
  const whyVolunteerBody = overviewSettings?._rawWhyVolunteerBody || [];

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
            {renderPortableText(overviewSubheader, {
              "& p": {
                variant: "styles.p",
                color: "text",
                mb: "1rem",
                mt: 0,
                fontSize: "16pt",
              },
            })}
          </Box>
          {overviewImage?.asset && (
            <SanityImage
              {...overviewImage}
              width={720}
              alt={overviewImage.alt || "Volunteer overview image"}
              sx={{
                width: ["100%", "100%", "320px", "360px"],
                height: ["280px", "320px", "280px", "300px"],
                objectFit: "cover",
                objectPosition: "center 82%",
                borderRadius: "18px",
                flex: "0 0 auto",
              }}
            />
          )}
        </Flex>
        <Box>
          <PermalinkHeading
            as="h2"
            id="getting-started"
            linkText="Getting Started"
            component={Heading}
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            Getting Started
          </PermalinkHeading>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: ["1fr", "1fr", "repeat(2, minmax(0, 1fr))"],
              gap: 0,
              mb: "0.35rem",
            }}
          >
            {gettingStartedSteps.map((step, index) => {
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
                      {renderPortableText(step.body, {
                        "& p": {
                          variant: "styles.p",
                          mt: 0,
                          mb: 0,
                          fontSize: [
                            "1.02rem",
                            "1.04rem",
                            "1.1rem",
                            "1.12rem",
                          ],
                          lineHeight: 1.45,
                        },
                        "& p + p": {
                          mt: "0.35rem",
                        },
                        "& a": {
                          color: "primary",
                          textDecoration: "none",
                          "&:hover": { color: "secondary" },
                        },
                      })}
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
          <PermalinkHeading
            as="h2"
            id="skill-level-guide"
            linkText="Skill Level Guide"
            component={Heading}
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            Skill Level Guide
          </PermalinkHeading>
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
            {[
              {
                icon: FaUserPlus,
                backgroundColor: "#e8f7ec",
                hoverColor: "#d4f1dd",
              },
              {
                icon: FaTools,
                backgroundColor: "#fff6d5",
                hoverColor: "#ffe9a6",
              },
              {
                icon: FaAward,
                backgroundColor: "#ffe6e6",
                hoverColor: "#ffd1d1",
              },
            ]
              .slice(0, skillLevelCards.length)
              .map((cardStyle, index) => {
                const card = skillLevelCards[index];
                const Icon = cardStyle.icon;
                return (
                  <Box
                    key={`skill-level-card-${index}`}
                    sx={{
                      borderLeft: [
                        "none",
                        "none",
                        index === 0 ? "none" : "2px solid",
                        index === 0 ? "none" : "2px solid",
                      ],
                      borderLeftColor: "black",
                      borderTop: [
                        index === 0 ? "none" : "2px solid",
                        index === 0 ? "none" : "2px solid",
                        "none",
                        "none",
                      ],
                      borderTopColor: "black",
                      backgroundColor: cardStyle.backgroundColor,
                      p: ["1.25rem", "1.25rem", "1.75rem", "2rem"],
                      minHeight: ["auto", "auto", "180px", "200px"],
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: cardStyle.hoverColor,
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
                        <Icon size={42} />
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
                          {card.title}
                        </Heading>
                        {renderPortableText(card.body, {
                          "& p": {
                            variant: "styles.p",
                            fontSize: ["0.95rem", "1rem", null, null],
                            mt: 0,
                            mb: 0,
                            textAlign: "left",
                          },
                          "& p + p": {
                            mt: "0.35rem",
                            fontWeight: "heading",
                          },
                        })}
                      </Box>
                    </Flex>
                    <Flex
                      sx={{
                        display: ["none", "none", "flex", "flex"],
                        alignItems: "center",
                        gap: "0.65rem",
                      }}
                    >
                      <Icon size={32} />
                      <Heading
                        as="h3"
                        sx={{
                          variant: "styles.h3",
                          fontSize: ["1.3rem", "1.35rem", "1.6rem", "1.75rem"],
                          my: 0,
                        }}
                      >
                        {card.title}
                      </Heading>
                    </Flex>
                    {renderPortableText(card.body, {
                      "& p": {
                        variant: "styles.p",
                        fontSize: ["0.95rem", "1rem", "1.05rem", "1.05rem"],
                        mt: 0,
                        mb: 0,
                        display: ["none", "none", "block", "block"],
                      },
                      "& p + p": {
                        mt: "0.35rem",
                        fontWeight: "heading",
                      },
                    })}
                  </Box>
                );
              })}
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

          <PermalinkHeading
            as="h2"
            id="role-scope"
            linkText="Role Scope"
            component={Heading}
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            Role Scope
          </PermalinkHeading>
          {renderPortableText(roleScopeBody, {
            "& p": {
              variant: "styles.p",
              mt: 0,
              mb: "0.75rem",
            },
            "& p:last-of-type": {
              mb: "1.5rem",
            },
          })}
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
            {[
              {
                icon: FaCalendarAlt,
                backgroundColor: "#e6f0ff",
                hoverColor: "#dce9ff",
              },
              {
                icon: FaBuilding,
                backgroundColor: "#eef3f5",
                hoverColor: "#e6edf0",
              },
            ]
              .slice(0, roleScopeCards.length)
              .map((cardStyle, index) => {
                const card = roleScopeCards[index];
                const Icon = cardStyle.icon;
                return (
                  <Box
                    key={`role-scope-card-${index}`}
                    sx={{
                      borderLeft: [
                        "none",
                        "none",
                        index === 0 ? "none" : "1px solid",
                        index === 0 ? "none" : "1px solid",
                      ],
                      borderLeftColor: "black",
                      borderTop: [
                        index === 0 ? "none" : "1px solid",
                        index === 0 ? "none" : "1px solid",
                        "none",
                        "none",
                      ],
                      borderTopColor: "black",
                      backgroundColor: cardStyle.backgroundColor,
                      p: ["1.25rem", "1.25rem", "1.75rem", "2rem"],
                      minHeight: ["auto", "auto", "180px", "200px"],
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: cardStyle.hoverColor,
                      },
                    }}
                  >
                    <Flex sx={{ alignItems: "center", gap: "0.65rem" }}>
                      <Icon size={32} />
                      <Heading
                        as="h3"
                        sx={{
                          variant: "styles.h3",
                          fontSize: ["1.3rem", "1.35rem", "1.6rem", "1.75rem"],
                          my: 0,
                        }}
                      >
                        {card.title}
                      </Heading>
                    </Flex>
                    {renderPortableText(card.body, {
                      "& p": {
                        variant: "styles.p",
                        fontSize: ["0.95rem", "1rem", "1.05rem", "1.05rem"],
                        mt: "0.5rem",
                        mb: 0,
                      },
                      "& ul": {
                        mt: "0.45rem",
                        mb: 0,
                        pl: "1.15rem",
                        listStyleType: "disc",
                        lineHeight: 1.6,
                      },
                      "& li": {
                        mb: 0,
                      },
                    })}
                  </Box>
                );
              })}
          </Box>

          <PermalinkHeading
            as="h2"
            id="why-volunteer"
            linkText="Why Volunteer"
            component={Heading}
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            Why Volunteer?
          </PermalinkHeading>
          {renderPortableText(whyVolunteerBody, {
            "& ul": {
              pl: "1.25rem",
              mb: "1rem",
              lineHeight: "body",
              listStyleType: "disc",
            },
            "& li": {
              mb: "0.5rem",
            },
          })}
        </Box>
      </ContentContainer>
    </Layout>
  );
};

export default VolunteerOverviewPage;
