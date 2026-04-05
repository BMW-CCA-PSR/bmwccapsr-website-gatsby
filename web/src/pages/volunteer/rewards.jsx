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
import PortableText from "../../components/portableText";

export const query = graphql`
  query VolunteerRewardsPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    rewardsSettings: sanityVolunteerRewardsPageSettings(
      _id: { regex: "/(drafts.|)volunteerRewardsPageSettings/" }
    ) {
      heroHighlights
      _rawIntroBody(resolveReferences: { maxDepth: 5 })
      _rawHowProgramWorksBody(resolveReferences: { maxDepth: 5 })
      pointLevels {
        points
        heading
        lead
        bullets
      }
      pointLevelsFootnote
      _rawEligibilityBody(resolveReferences: { maxDepth: 5 })
      faqIntro
      faqs {
        question
        _rawAnswer(resolveReferences: { maxDepth: 5 })
      }
    }
  }
`;

const pointLevelStyles = [
  {
    accentBg: "#e8f7ec",
    accentColor: "#1f7a3f",
  },
  {
    accentBg: "#fff6d5",
    accentColor: "#8b6b00",
  },
  {
    accentBg: "#ffe6e6",
    accentColor: "#9a1f1f",
  },
  {
    accentBg: "#e6f0ff",
    accentColor: "#2357b3",
  },
];

const renderPortableText = (body, boxedSx) =>
  Array.isArray(body) && body.length > 0 ? (
    <PortableText body={body} boxedSx={boxedSx} />
  ) : null;

const parsePointLines = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return [];

  const explicitLines = rawValue
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (explicitLines.length > 1) {
    return explicitLines;
  }

  const rangeMatch = rawValue.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (rangeMatch) {
    return [rangeMatch[1], rangeMatch[2]];
  }

  return [rawValue];
};

const formatPointDisplayValue = (value) => {
  const pointLines = parsePointLines(value);
  if (pointLines.length === 2) {
    return `${pointLines[0]}   \n${pointLines[1]}`;
  }
  return pointLines.join("\n");
};

const VolunteerRewardsPage = ({ data, errors }) => {
  const site = data?.site;
  const rewardsSettings = data?.rewardsSettings;
  const menuItems = site?.navMenu?.items || [];
  const heroHighlights = Array.isArray(rewardsSettings?.heroHighlights)
    ? rewardsSettings.heroHighlights.filter(Boolean).slice(0, 3)
    : [];
  const introBody = rewardsSettings?._rawIntroBody || [];
  const howProgramWorksBody = rewardsSettings?._rawHowProgramWorksBody || [];
  const pointLevels = Array.isArray(rewardsSettings?.pointLevels)
    ? rewardsSettings.pointLevels
    : [];
  const pointLevelsFootnote = String(
    rewardsSettings?.pointLevelsFootnote || "",
  ).trim();
  const eligibilityBody = rewardsSettings?._rawEligibilityBody || [];
  const faqIntro = String(rewardsSettings?.faqIntro || "").trim();
  const faqs = Array.isArray(rewardsSettings?.faqs) ? rewardsSettings.faqs : [];

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
          {heroHighlights.length > 0 && (
            <Heading
              as="h2"
              sx={{
                variant: "styles.h2",
                mt: "1rem",
                mb: "0.5rem",
                lineHeight: [1.24, 1.2, null, null],
              }}
            >
              {heroHighlights.map((item, index) => (
                <Text
                  key={`hero-highlight-${index}`}
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
                    {item}
                  </Box>
                  .
                  {index < heroHighlights.length - 1 ? " " : ""}
                </Text>
              ))}
            </Heading>
          )}

          {renderPortableText(introBody, {
            "& p": {
              variant: "styles.p",
              color: "text",
              mb: "1rem",
              mt: 0,
              fontSize: "16pt",
            },
            "& a": {
              color: "primary",
              textDecoration: "none",
              "&:hover": { color: "secondary" },
            },
          })}

          <PermalinkHeading
            as="h2"
            id="how-the-program-works"
            linkText="How the Program Works"
            component={Heading}
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            How the Program Works
          </PermalinkHeading>
          {renderPortableText(howProgramWorksBody, {
            "& p": {
              variant: "styles.p",
              color: "text",
              mb: "1rem",
              mt: 0,
            },
            "& a": {
              color: "primary",
              textDecoration: "none",
              "&:hover": { color: "secondary" },
            },
          })}

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
          {pointLevels.length > 0 && (
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
              {pointLevels.map((level, index) => {
                const style = pointLevelStyles[index] || pointLevelStyles[0];
                const pointDisplayValue = formatPointDisplayValue(level?.points);
                return (
                  <Box
                    key={level.heading || `point-level-${index}`}
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
                          backgroundColor: style.accentBg,
                          color: style.accentColor,
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
                          {pointDisplayValue}
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
                        {pointDisplayValue}
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
                      {level.lead ? (
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
                      ) : null}
                      {Array.isArray(level.bullets) && level.bullets.length > 0 ? (
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
                          {level.bullets.filter(Boolean).map((item) => (
                            <Box as="li" key={item} sx={{ mb: "0.35rem" }}>
                              {item}
                            </Box>
                          ))}
                        </Box>
                      ) : null}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
          {pointLevelsFootnote ? (
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
                {pointLevelsFootnote}
              </Text>
            </Box>
          ) : null}

          <PermalinkHeading
            as="h2"
            id="eligibility-and-requirements"
            linkText="Eligibility and Requirements"
            component={Heading}
            sx={{ variant: "styles.h2", mt: "1.25rem", mb: "0.5rem" }}
          >
            Eligibility & Requirements
          </PermalinkHeading>
          {renderPortableText(eligibilityBody, {
            "& p": {
              variant: "styles.p",
              color: "text",
              mb: "1rem",
              mt: 0,
            },
            "& ul": {
              pl: "1.25rem",
              mb: "0.5rem",
              lineHeight: "body",
              listStyleType: "disc",
            },
            "& li": {
              mb: "0.5rem",
            },
          })}

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
            {faqIntro ? (
              <Text
                sx={{ variant: "styles.p", color: "text", mt: 0, mb: "0.5rem" }}
              >
                {faqIntro}
              </Text>
            ) : null}
            {faqs.length > 0 ? (
              <Box
                sx={{
                  mt: "1rem",
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
                    key={item.question || `faq-${index}`}
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
                        pt: ["0.15rem", "0.2rem"],
                        pb: ["1rem", "1.15rem"],
                        pr: ["1rem", "4rem"],
                        color: "text",
                      }}
                    >
                      {renderPortableText(item?._rawAnswer || [], {
                        "& p": {
                          variant: "styles.p",
                          mt: 0,
                          mb: 0,
                          color: "inherit",
                          fontSize: "sm",
                          lineHeight: 1.7,
                        },
                        "& p + p": {
                          mt: "0.85rem",
                        },
                        "& ul": {
                          mt: "0.65rem",
                          mb: 0,
                          pl: "1.15rem",
                          listStyleType: "disc",
                          lineHeight: 1.7,
                        },
                        "& li": {
                          mb: 0,
                        },
                        "& a": {
                          color: "primary",
                          textDecoration: "none",
                          "&:hover": { color: "secondary" },
                        },
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : null}
          </Box>
        </Box>
      </ContentContainer>
    </Layout>
  );
};

export default VolunteerRewardsPage;
