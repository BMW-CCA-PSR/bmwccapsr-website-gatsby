/** @jsxImportSource theme-ui */
import React, { useEffect, useState } from "react";
import { graphql, Link } from "gatsby";
import {
  Container,
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  Button
} from "@theme-ui/components";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import { format, parseISO } from "date-fns";
import SanityImage from "gatsby-plugin-sanity-image";
import Layout from "../containers/layout";
import Seo from "../components/seo";
import GraphQLErrorList from "../components/graphql-error-list";
import {
  mapEdgesToNodes,
  filterOutDocsWithoutSlugs,
  getEventsUrl
} from "../lib/helpers";

const baseJoinUrl = "https://www.bmwcca.org/join";
const heroImage = "/images/bmw-join-image.jpg";

const cleanParams = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value));

const getTrackingParams = (search) => {
  if (!search) {
    return {};
  }
  const params = new URLSearchParams(search);
  const source =
    params.get("utm_source") || params.get("src") || params.get("source") || "";
  return cleanParams({
    utm_source: source,
    utm_medium: params.get("utm_medium") || params.get("medium") || "",
    utm_campaign: params.get("utm_campaign") || params.get("campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || ""
  });
};

const buildTrackedUrl = (baseUrl, params) => {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
};

const primaryButton = {
  textTransform: "uppercase",
  textDecoration: "none",
  fontSize: 15,
  backgroundColor: "primary",
  border: "none",
  color: "white",
  py: "10px",
  px: "22px",
  borderRadius: "4px",
  letterSpacing: "0.08em",
  transition: "background-color 0.3s ease-out, transform 0.3s ease-out",
  boxShadow: "0 10px 18px -6px rgba(0, 0, 0, 0.25)",
  "&:hover": {
    color: "white",
    bg: "highlight",
    transform: "translateY(-1px)"
  }
};

const outlineButton = {
  textTransform: "uppercase",
  textDecoration: "none",
  fontSize: 14,
  border: "1px solid",
  borderColor: "primary",
  color: "primary",
  py: "8px",
  px: "18px",
  borderRadius: "4px",
  letterSpacing: "0.08em",
  transition: "background-color 0.3s ease-out, color 0.3s ease-out",
  "&:hover": {
    color: "white",
    bg: "primary"
  }
};

const calendarButton = {
  ...outlineButton,
  color: "secondary",
  borderColor: "secondary",
  bg: "white",
  "&:hover": {
    color: "white",
    bg: "secondary"
  }
};

const benefits = [
  {
    title: "Driving events, tours, and meetups",
    description: "From scenic drives to track days and tech sessions."
  },
  {
    title: "Rebates on new and CPO vehicles",
    description: "Apply for up to $1,500 in rebates on eligible purchases."
  },
  {
    title: "A welcoming community of enthusiasts",
    description: "Connect with people who love the marque as much as you do."
  },
  {
    title: "Parts, service, and partner discounts",
    description: "Member pricing from major suppliers and providers."
  },
  {
    title: "Membership that pays for itself",
    description: "Just $58 per year with national perks and savings."
  },
  {
    title: "Exclusive merchandise access",
    description: "Apparel and lifestyle gear for BMW CCA members."
  },
  {
    title: "Dream car sweepstakes",
    description: "Enter to win a new or classic BMW each year."
  }
];

const benefitsPrimary = benefits.slice(0, 3);
const benefitsSecondary = benefits.slice(3);

const isBoardMeeting = (event) => {
  const title = (event.title || "").toLowerCase();
  const category = (event.category && event.category.title
    ? event.category.title
    : ""
  ).toLowerCase();
  return (
    title.includes("board meeting") ||
    (title.includes("board") && title.includes("meeting")) ||
    category.includes("board")
  );
};

const QrLandingPage = (props) => {
  const { data, errors, location } = props;

  const [joinHref, setJoinHref] = useState(baseJoinUrl);
  const [trackingParams, setTrackingParams] = useState({});
  const locationSearch = (location && location.search) || "";
  const search =
    locationSearch ||
    (typeof window !== "undefined" ? window.location.search : "");

  useEffect(() => {
    const trackingParams = getTrackingParams(search);
    setTrackingParams(trackingParams);
    setJoinHref(buildTrackedUrl(baseJoinUrl, trackingParams));

    if (typeof window !== "undefined" && window.gtag) {
      const eventParams = cleanParams({
        ...trackingParams,
        entry_source: trackingParams.utm_source || "unknown",
        page_location: window.location.href
      });
      window.gtag("event", "qr_landing_view", eventParams);
    }
  }, [search]);

  const handleJoinClick = () => {
    if (typeof window !== "undefined" && window.gtag) {
      const eventParams = cleanParams({
        ...trackingParams,
        entry_source: trackingParams.utm_source || "unknown",
        page_location: window.location.href
      });
      window.gtag("event", "join_click", eventParams);
    }
  };

  if (errors) {
    return (
      <Layout>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  const site = data?.site;
  const menuItems = site?.navMenu?.items || [];
  const eventNodes = data?.events
    ? mapEdgesToNodes(data.events)
        .filter(filterOutDocsWithoutSlugs)
        .filter((event) => !isBoardMeeting(event))
        .slice(0, 6)
    : [];

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo
        title="Welcome"
        description="Discover BMW CCA Puget Sound Region events, benefits, and how to join."
        keywords={["BMW CCA", "Puget Sound", "events", "club", "membership"]}
      />
      <main>
        <Container
          sx={{
            pl: ["16px", "16px", "50px", "100px"],
            pr: ["16px", "16px", "50px", "100px"],
            pt: ["6.5rem", "6.5rem", "9rem", "9rem"],
            pb: "2rem"
          }}
        >
          <Box
            sx={{
              backgroundImage:
                "linear-gradient(135deg, #063b7a 0%, #1e94ff 55%, #86c8ff 100%)",
              color: "white",
              borderRadius: "18px",
              boxShadow: "0 20px 30px -18px rgba(0, 0, 0, 0.4)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: ["column", "column", "row"],
              minHeight: ["auto", "auto", "360px"]
            }}
          >
            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                maxWidth: ["100%", "100%", "56%"],
                p: ["1.5rem", "2rem", "3rem"],
                pr: ["1.5rem", "2rem", "2.5rem"]
              }}
            >
              <Text
                sx={{
                  variant: "text.label",
                  color: "white",
                  letterSpacing: "wide"
                }}
              >
                BMW CCA Puget Sound Region
              </Text>
              <Heading
                as="h1"
                sx={{
                  variant: "styles.h1",
                  color: "white",
                  mt: "0.75rem",
                  maxWidth: "40rem"
                }}
              >
                Thanks for scanning. Welcome to the club.
              </Heading>
              <Text
                sx={{
                  fontSize: ["18px", "20px", "24px"],
                  maxWidth: "36rem",
                  mt: "1rem",
                  lineHeight: "1.5"
                }}
              >
                We are a community of BMW enthusiasts who host driving events,
                social meetups, and technical sessions across the Pacific
                Northwest. Here is a quick look at what is coming up and why
                members love PSR.
              </Text>
            </Box>
            <Box
              sx={{
                position: ["relative", "relative", "absolute"],
                right: ["auto", "auto", 0],
                top: ["auto", "auto", 0],
                bottom: ["auto", "auto", 0],
                width: ["100%", "100%", "44%"],
                height: ["200px", "240px", "100%"],
                mt: ["1.5rem", "1.5rem", 0],
                clipPath: [
                  "none",
                  "none",
                  "polygon(12% 0, 100% 0, 100% 100%, 0 100%)"
                ],
                borderTopRightRadius: "18px",
                borderBottomRightRadius: "18px",
                overflow: "hidden"
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${heroImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: "scale(1.05)"
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(120deg, rgba(6, 59, 122, 0.35), rgba(6, 59, 122, 0.1))"
                }}
              />
            </Box>
          </Box>
        </Container>

        <Box id="upcoming" sx={{ backgroundColor: "lightgray", py: "2.5rem" }}>
          <Container
            sx={{
              pl: ["16px", "16px", "50px", "100px"],
              pr: ["16px", "16px", "50px", "100px"]
            }}
          >
            <Flex
              sx={{
                justifyContent: "space-between",
                alignItems: ["flex-start", "center"],
                flexDirection: ["column", "row"],
                gap: "0.75rem"
              }}
            >
              <Heading sx={{ variant: "styles.h2" }}>
                Upcoming events
              </Heading>
              <Link to="/events" sx={{ textDecoration: "none" }}>
                <Button sx={calendarButton}>Full Calendar</Button>
              </Link>
            </Flex>
            <Text sx={{ mt: "0.5rem", maxWidth: "38rem" }}>
              A simplified look at the next few events. See the full calendar
              for all details and registration info.
            </Text>

            {eventNodes.length > 0 ? (
              <Grid
                sx={{
                  gridTemplateColumns: [
                    "1fr",
                    "1fr",
                    "repeat(2, minmax(0, 1fr))",
                    "repeat(2, minmax(0, 1fr))"
                  ],
                  gap: "1.5rem",
                  mt: "1.5rem"
                }}
              >
                {eventNodes.map((event) => {
                  const startDate = event.startTime
                    ? format(parseISO(event.startTime), "EEE, MMM d")
                    : "";
                  const startTime = event.startTime
                    ? format(parseISO(event.startTime), "p")
                    : "";
                  const cityState =
                    event.address && event.address.city && event.address.state
                      ? `${event.address.city}, ${event.address.state}`
                      : "";
                  return (
                    <Link
                      key={event.id}
                      to={getEventsUrl(event.slug.current)}
                      sx={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          backgroundColor: "background",
                          borderRadius: "14px",
                          border: "1px solid",
                          borderColor: "gray",
                          height: "100%",
                          overflow: "hidden",
                          boxShadow:
                            "0 12px 20px -16px rgba(0, 0, 0, 0.4)",
                          transition:
                            "transform 0.3s ease-out, box-shadow 0.3s ease-out",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            boxShadow:
                              "0 20px 28px -20px rgba(0, 0, 0, 0.5)"
                          },
                          "&:hover .event-image-frame": {
                            transform: "scaleX(1.08)"
                          },
                          "&:hover .event-image": {
                            transform: "scale(1.08)"
                          }
                        }}
                      >
                        <Flex
                          sx={{
                            flexDirection: ["column", "row"],
                            alignItems: "stretch",
                            minHeight: ["auto", "170px", "190px"]
                          }}
                        >
                          <Box
                            sx={{
                              width: ["100%", "120px", "140px"],
                              minHeight: ["170px", "100%"],
                              flexShrink: 0,
                              position: "relative",
                              overflow: "hidden",
                              backgroundColor: "lightgray",
                              clipPath: [
                                "none",
                                "none",
                                "polygon(0 0, 100% 0, 88% 100%, 0 100%)"
                              ],
                              transition: "transform 0.35s ease-out",
                              transformOrigin: "left center",
                              transform: "scaleX(1)",
                              zIndex: 1
                            }}
                            className="event-image-frame"
                          >
                            {event.mainImage && event.mainImage.asset ? (
                              <SanityImage
                                {...event.mainImage}
                                width={320}
                                className="event-image"
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  transition: "transform 0.35s ease-out",
                                  transformOrigin: "left center"
                                }}
                              />
                            ) : (
                              <Box
                                className="event-image"
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  backgroundImage:
                                    "linear-gradient(135deg, #1e94ff 0%, #86c8ff 100%)",
                                  transition: "transform 0.35s ease-out",
                                  transformOrigin: "left center"
                                }}
                              />
                            )}
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              p: "1.25rem",
                              flex: "1 1 auto"
                            }}
                          >
                            <Text
                              sx={{
                                variant: "text.label",
                                color: "secondary"
                              }}
                            >
                              {startDate}
                              {startTime ? ` - ${startTime}` : ""}
                            </Text>
                            <Heading
                              sx={{
                                variant: "styles.h3",
                                mt: "0.5rem",
                                mb: "0.5rem",
                                color: "black"
                              }}
                            >
                              {event.title}
                            </Heading>
                            {cityState && (
                              <Text sx={{ color: "darkgray" }}>
                                {cityState}
                              </Text>
                            )}
                            <Text
                              sx={{
                                mt: "0.75rem",
                                color: "primary",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                fontSize: 13
                              }}
                            >
                              View details
                            </Text>
                          </Box>
                        </Flex>
                        <Box
                          sx={{
                            height: "6px",
                            width: "100%",
                            bg: "primary",
                            borderBottomLeftRadius: "14px",
                            borderBottomRightRadius: "14px"
                          }}
                        />
                      </Box>
                    </Link>
                  );
                })}
              </Grid>
            ) : (
              <Box sx={{ mt: "1.5rem" }}>
                <Text sx={{ fontSize: "sm" }}>
                  No upcoming events are listed right now. Check the full
                  calendar for the latest updates.
                </Text>
              </Box>
            )}
          </Container>
        </Box>

        <Box id="benefits" sx={{ py: "2.5rem" }}>
          <Container
            sx={{
              pl: ["16px", "16px", "50px", "100px"],
              pr: ["16px", "16px", "50px", "100px"]
            }}
          >
            <Heading sx={{ variant: "styles.h2" }}>Member benefits</Heading>
            <Text sx={{ mt: "0.5rem", maxWidth: "40rem", color: "darkgray" }}>
              Membership opens the door to local experiences, trusted knowledge,
              and a national community built around driving passion.
            </Text>
            <Box
              sx={{
                mt: "1.5rem",
                display: "flex",
                flexDirection: ["column", "column", "row"],
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 18px 30px -22px rgba(0, 0, 0, 0.45)"
              }}
            >
              <Box
                sx={{
                  backgroundColor: "lightgray",
                  p: ["1.5rem", "1.75rem", "2rem"],
                  flex: "1 1 55%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}
              >
                <ul
                  sx={{
                    listStyleType: "disc",
                    pl: "1.5rem",
                    mt: 0,
                    mb: 0
                  }}
                >
                  {benefitsPrimary.map((benefit) => (
                    <li key={benefit.title} sx={{ mb: "1rem" }}>
                      <Text
                        as="span"
                        sx={{
                          fontWeight: "700",
                          color: "text",
                          fontSize: ["20px", "22px", "24px"]
                        }}
                      >
                        {benefit.title}
                      </Text>
                      <Text as="span" sx={{ color: "darkgray" }}>
                        {` — ${benefit.description}`}
                      </Text>
                    </li>
                  ))}
                </ul>
              </Box>

              <Box
                sx={{
                  minHeight: ["220px", "260px", "320px"],
                  flex: "1 1 45%",
                  position: "relative",
                  backgroundColor: "lightgray"
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "url(/images/join1.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(140deg, rgba(6, 59, 122, 0.2), rgba(6, 59, 122, 0))"
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                mt: ["1.5rem", "1.75rem", "2rem"],
                display: "flex",
                flexDirection: ["column", "column", "row"],
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 18px 30px -22px rgba(0, 0, 0, 0.45)"
              }}
            >
              <Box
                sx={{
                  minHeight: ["220px", "260px", "300px"],
                  flex: "1 1 45%",
                  position: "relative",
                  backgroundColor: "lightgray"
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "url(/images/join2.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(160deg, rgba(6, 59, 122, 0.15), rgba(6, 59, 122, 0))"
                  }}
                />
              </Box>

              <Box
                sx={{
                  backgroundColor: "lightgray",
                  p: ["1.5rem", "1.75rem", "2rem"],
                  flex: "1 1 55%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}
              >
                <ul
                  sx={{
                    listStyleType: "disc",
                    pl: "1.5rem",
                    mt: 0,
                    mb: 0
                  }}
                >
                  {benefitsSecondary.map((benefit) => (
                    <li key={benefit.title} sx={{ mb: "1rem" }}>
                      <Text
                        as="span"
                        sx={{
                          fontWeight: "700",
                          color: "text",
                          fontSize: ["20px", "22px", "24px"]
                        }}
                      >
                        {benefit.title}
                      </Text>
                      <Text as="span" sx={{ color: "darkgray" }}>
                        {` — ${benefit.description}`}
                      </Text>
                    </li>
                  ))}
                </ul>
              </Box>
            </Box>

            <Box
              sx={{
                mt: "2.5rem",
                backgroundColor: "secondary",
                color: "white",
                borderRadius: "16px",
                p: ["1.5rem", "2rem", "2.5rem"],
                textAlign: "center"
              }}
            >
              <Heading sx={{ variant: "styles.h2", color: "white" }}>
                Ready to join?
              </Heading>
              <Text sx={{ mt: "0.75rem", maxWidth: "38rem", mx: "auto" }}>
                Membership gets you access to local events, the national BMW CCA
                community, and a full calendar of experiences.
              </Text>
              <Box sx={{ mt: "1.5rem" }}>
                <OutboundLink
                  href={joinHref}
                  rel="noopener noreferrer"
                  target="_blank"
                  sx={{ textDecoration: "none" }}
                >
                  <Button sx={primaryButton} onClick={handleJoinClick}>
                    Join the Club
                  </Button>
                </OutboundLink>
              </Box>
            </Box>
          </Container>
        </Box>
      </main>
    </Layout>
  );
};

export const query = graphql`
  query QrLandingPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    events: allSanityEvent(
      limit: 12
      sort: { fields: [startTime], order: ASC }
      filter: { slug: { current: { ne: null } }, isActive: { eq: true } }
    ) {
      edges {
        node {
          id
          title
          startTime
          category {
            title
          }
          mainImage {
            ...SanityImage
            alt
            asset {
              metadata {
                lqip
              }
            }
          }
          slug {
            current
          }
          address {
            city
            state
          }
        }
      }
    }
  }
`;

export default QrLandingPage;
