/** @jsxImportSource theme-ui */
import React, { useEffect, useState } from "react";
import { graphql, Link } from "gatsby";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  Button
} from "@theme-ui/components";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import Layout from "../containers/layout";
import Seo from "../components/seo";
import GraphQLErrorList from "../components/graphql-error-list";
import ContentContainer from "../components/content-container";
import PortableText from "../components/portableText";

const baseJoinUrl = "https://www.bmwcca.org/join";
const heroImage = "/images/bmw-join-image.jpg";
const heroSlant = "16%";

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

const QrLandingPage = (props) => {
  const { data, errors, location } = props;
  const eventYear = new Date().getFullYear();
  const joinPage = data?.joinPage;
  const joinHero = joinPage?.joinHero || {};
  const hpdeSection = joinPage?.joinHpdeSection || {};
  const socialSection = joinPage?.joinSocialSection || {};
  const highlightsIntro = joinPage?.joinEventHighlightsIntro;
  const benefitsIntro = joinPage?.joinBenefitsIntro;
  const hpdeItems = hpdeSection?.items || [];
  const socialItems = socialSection?.items || [];
  const hpdeSubtext = hpdeSection?.subtext;
  const socialColumns = socialSection?.columns || 2;
  const benefitsPrimaryList = joinPage?.joinBenefitsPrimary || [];
  const benefitsSecondaryList = joinPage?.joinBenefitsSecondary || [];

  const renderSubheading = (blocks) => {
    if (Array.isArray(blocks) && blocks.length > 0) {
      return (
        <PortableText
          body={blocks}
          boxedSx={{
            "& p": { mt: "0.75rem", mb: 0, color: "darkgray" },
          }}
        />
      );
    }
    return null;
  };

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
  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo
        title="Welcome"
        description="Discover BMW CCA Puget Sound Region events, benefits, and how to join."
        keywords={["BMW CCA", "Puget Sound", "events", "club", "membership"]}
      />
      <main>
        <ContentContainer
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
              {joinHero.label ? (
                <Text
                  sx={{
                    variant: "text.label",
                    color: "white",
                    letterSpacing: "wide"
                  }}
                >
                  {joinHero.label}
                </Text>
              ) : null}
              {joinHero.heading ? (
                <Heading
                  as="h1"
                  sx={{
                    variant: "styles.h1",
                    color: "white",
                    mt: "0.75rem",
                    maxWidth: "40rem"
                  }}
                >
                  {joinHero.heading}
                </Heading>
              ) : null}
              {joinHero.subheading ? (
                <Text
                  sx={{
                    fontSize: ["18px", "20px", "24px"],
                    maxWidth: "36rem",
                    mt: "1rem",
                    lineHeight: "1.5"
                  }}
                >
                  {joinHero.subheading}
                </Text>
              ) : null}
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
                  `polygon(${heroSlant} 0, 100% 0, 100% 100%, 0 100%)`
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
        </ContentContainer>

        <Box id="events" sx={{ backgroundColor: "lightgray", py: "2.5rem" }}>
          <ContentContainer
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
              <Heading sx={{ variant: "styles.h2", mb: "0.25rem" }}>
                Event highlights for {eventYear}
              </Heading>
              <Link
                to="/events"
                sx={{
                  display: "inline-block",
                  px: "1.25rem",
                  py: "0.55rem",
                  borderRadius: "4px",
                  backgroundColor: "primary",
                  color: "white",
                  textDecoration: "none",
                  fontSize: "xs",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  "&:hover": {
                    bg: "highlight",
                    color: "white"
                  }
                }}
              >
                All Events
              </Link>
            </Flex>
            <Box
              as="hr"
              sx={{
                border: "none",
                borderTop: "2px solid",
                borderColor: "text",
                mt: "0.75rem",
                mb: "1.25rem"
              }}
            />
            {highlightsIntro ? (
              <Text sx={{ mt: "0.75rem", maxWidth: "42rem" }}>
                {highlightsIntro}
              </Text>
            ) : null}

            <Box
              sx={{
                mt: "1.5rem",
                backgroundColor: "background",
                borderRadius: "18px",
                border: "1px solid",
                borderColor: "gray",
                boxShadow: "0 18px 28px -20px rgba(0, 0, 0, 0.4)",
                overflow: "hidden",
                display: "flex",
                flexDirection: ["column", "column", "row"]
              }}
            >
              <Box
                sx={{
                  p: ["1.5rem", "1.75rem", "2.25rem"],
                  flex: "1 1 58%"
                }}
              >
                <Heading
                  as="h3"
                  sx={{ variant: "styles.h3", color: "text", mb: "0.5rem" }}
                >
                  {hpdeSection.heading}
                </Heading>
                {renderSubheading(hpdeSection?.subheading)}
                <ul
                  sx={{
                    listStyleType: "disc",
                    pl: "1.5rem",
                    mt: "1.5rem",
                    mb: 0
                  }}
                >
                  {hpdeItems.map((event) => (
                    <li key={event._key || event.title} sx={{ mb: "1rem" }}>
                      <Text sx={{ fontWeight: "700", color: "text" }}>
                        {event.title}
                      </Text>
                      {event.details && (
                        <Text
                          sx={{
                            display: "block",
                            color: "darkgray",
                            mt: "0.35rem"
                          }}
                        >
                          {event.details}
                        </Text>
                      )}
                    </li>
                  ))}
                </ul>
                {hpdeSubtext ? (
                  <Text sx={{ mt: "1rem", fontSize: "xxs", color: "darkgray" }}>
                    {hpdeSubtext}
                  </Text>
                ) : null}
                <Link
                  to="/events?category=Driver+Education&excludeBoard=1"
                  sx={{
                    display: "inline-block",
                    mt: "1.25rem",
                    px: "1.25rem",
                    py: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid",
                    borderColor: "primary",
                    color: "primary",
                    textDecoration: "none",
                    fontSize: "xs",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    "&:hover": {
                      bg: "primary",
                      color: "white"
                    }
                  }}
                >
                  View All Driver Education Events
                </Link>
              </Box>

              <Box
                sx={{
                  position: "relative",
                  width: ["100%", "100%", "42%"],
                  minHeight: ["220px", "260px", "100%"],
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
                  data-tooltip="HPDE event at Pacific"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    "&:hover .image-layer": {
                      filter: "grayscale(100%)"
                    },
                    "&:hover .image-tint": {
                      opacity: 0.55
                    },
                    "&:hover::after": {
                      opacity: 1,
                      transform: "translateY(-6px)"
                    },
                    "&::after": {
                      content: "attr(data-tooltip)",
                      position: "absolute",
                      left: "12px",
                      bottom: "12px",
                      backgroundColor: "rgba(6, 59, 122, 0.92)",
                      color: "white",
                      fontSize: "12px",
                      letterSpacing: "0.02em",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      opacity: 0,
                      transform: "translateY(0)",
                      transition: "opacity 0.2s ease, transform 0.2s ease",
                      pointerEvents: "none",
                      maxWidth: "90%",
                      zIndex: 2
                    }
                  }}
                >
                  <Box
                    className="image-layer"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: "url(/images/hpde1.jpg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "grayscale(0%)",
                      transition: "filter 0.2s ease"
                    }}
                  />
                  <Box
                    className="image-tint"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(30, 148, 255, 0.55)",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                      pointerEvents: "none"
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(120deg, rgba(6, 59, 122, 0.25), rgba(6, 59, 122, 0.05))",
                    pointerEvents: "none",
                    zIndex: 0
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                mt: ["1.5rem", "1.75rem", "2rem"],
                backgroundColor: "background",
                borderRadius: "18px",
                border: "1px solid",
                borderColor: "gray",
                boxShadow: "0 18px 28px -20px rgba(0, 0, 0, 0.4)",
                overflow: "hidden",
                display: "flex",
                flexDirection: ["column", "column", "row"]
              }}
            >
              <Box
                sx={{
                  p: ["1.5rem", "1.75rem", "2.25rem"],
                  flex: "1 1 58%"
                }}
              >
                <Heading
                  as="h3"
                  sx={{ variant: "styles.h3", color: "text", mb: "0.5rem" }}
                >
                  {socialSection.heading}
                </Heading>
                {renderSubheading(socialSection?.subheading)}
                <ul
                  sx={{
                    listStyleType: "disc",
                    pl: "1.5rem",
                    mt: "1.5rem",
                    mb: 0,
                    columnCount: [1, 1, socialColumns],
                    columnGap: "1.5rem"
                  }}
                >
                  {socialItems.map((event) => (
                    <li
                      key={event._key || event.title}
                      sx={{ mb: "1rem", breakInside: "avoid" }}
                    >
                      <Text sx={{ fontWeight: "700", color: "text" }}>
                        {event.title}
                      </Text>
                      {event.details ? (
                        <Text
                          sx={{
                            display: "block",
                            color: "darkgray",
                            mt: "0.35rem"
                          }}
                        >
                          {event.details}
                        </Text>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {socialSection.subtext ? (
                  <Text sx={{ mt: "1rem", fontSize: "xxs", color: "darkgray" }}>
                    {socialSection.subtext}
                  </Text>
                ) : null}
                <Link
                  to="/events?category=Social+Events&excludeBoard=1"
                  sx={{
                    display: "inline-block",
                    mt: "1.25rem",
                    px: "1.25rem",
                    py: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid",
                    borderColor: "primary",
                    color: "primary",
                    textDecoration: "none",
                    fontSize: "xs",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    "&:hover": {
                      bg: "primary",
                      color: "white"
                    }
                  }}
                >
                  View All Social Events
                </Link>
              </Box>

              <Box
                sx={{
                  position: "relative",
                  width: ["100%", "100%", "42%"],
                  minHeight: ["220px", "260px", "100%"],
                  clipPath: [
                    "none",
                    "none",
                    "polygon(12% 0, 100% 0, 100% 100%, 0 100%)"
                  ],
                  borderTopRightRadius: "18px",
                  borderBottomRightRadius: "18px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: ["column", "row", "row"]
                }}
              >
                <Box
                  data-tooltip="Griots Tech Session"
                  sx={{
                    flex: "1 1 50%",
                    mr: ["0", "0", "-40px"],
                    transform: ["none", "none", "scaleX(1.12)"],
                    transformOrigin: "left center",
                    position: "relative",
                    zIndex: 1,
                    "&:hover .image-layer": {
                      filter: "grayscale(100%)"
                    },
                    "&:hover .image-tint": {
                      opacity: 0.55
                    },
                    "&:hover::after": {
                      opacity: 1,
                      transform: "translateY(-6px)"
                    },
                    "&::after": {
                      content: "attr(data-tooltip)",
                      position: "absolute",
                      left: "12px",
                      bottom: "12px",
                      backgroundColor: "rgba(6, 59, 122, 0.92)",
                      color: "white",
                      fontSize: "12px",
                      letterSpacing: "0.02em",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      opacity: 0,
                      transform: "translateY(0)",
                      transition: "opacity 0.2s ease, transform 0.2s ease",
                      pointerEvents: "none",
                      maxWidth: "90%",
                      zIndex: 2
                    }
                  }}
                >
                  <Box
                    className="image-layer"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: "url(/images/tech1.jpg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center left",
                      filter: "grayscale(0%)",
                      transition: "filter 0.2s ease"
                    }}
                  />
                  <Box
                    className="image-tint"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(30, 148, 255, 0.55)",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                      pointerEvents: "none"
                    }}
                  />
                </Box>
                <Box
                  data-tooltip="BC tour to Duffey Lake."
                  sx={{
                    flex: "1 1 50%",
                    clipPath: [
                      "none",
                      "none",
                      "polygon(24% 0, 100% 0, 100% 100%, 0 100%)"
                    ],
                    ml: ["0", "0", "-20px"],
                    position: "relative",
                    zIndex: 2,
                    "&:hover .image-layer": {
                      filter: "grayscale(100%)"
                    },
                    "&:hover .image-tint": {
                      opacity: 0.55
                    },
                    "&:hover::after": {
                      opacity: 1,
                      transform: "translateY(-6px)"
                    },
                    "&::after": {
                      content: "attr(data-tooltip)",
                      position: "absolute",
                      left: "12px",
                      bottom: "12px",
                      backgroundColor: "rgba(6, 59, 122, 0.92)",
                      color: "white",
                      fontSize: "12px",
                      letterSpacing: "0.02em",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      opacity: 0,
                      transform: "translateY(0)",
                      transition: "opacity 0.2s ease, transform 0.2s ease",
                      pointerEvents: "none",
                      maxWidth: "90%",
                      zIndex: 2
                    }
                  }}
                >
                  <Box
                    className="image-layer"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: "url(/images/tour1.png)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "grayscale(0%)",
                      transition: "filter 0.2s ease"
                    }}
                  />
                  <Box
                    className="image-tint"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(30, 148, 255, 0.55)",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                      pointerEvents: "none"
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(120deg, rgba(6, 59, 122, 0.2), rgba(6, 59, 122, 0.05))",
                    pointerEvents: "none",
                    zIndex: 0
                  }}
                />
              </Box>
            </Box>
          </ContentContainer>
        </Box>

        <Box id="benefits" sx={{ py: "2.5rem" }}>
          <ContentContainer
            sx={{
              pl: ["16px", "16px", "50px", "100px"],
              pr: ["16px", "16px", "50px", "100px"]
            }}
          >
            <Heading sx={{ variant: "styles.h2", mb: "0.25rem" }}>
              Member benefits
            </Heading>
            <Box
              as="hr"
              sx={{
                border: "none",
                borderTop: "2px solid",
                borderColor: "text",
                mt: "0.75rem",
                mb: "1.25rem"
              }}
            />
            {benefitsIntro ? (
              <Text sx={{ mt: "0.75rem", maxWidth: "40rem", color: "darkgray" }}>
                {benefitsIntro}
              </Text>
            ) : null}
            <Box
              sx={{
                mt: "1.5rem",
                display: "flex",
                flexDirection: ["column", "column", "row"],
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 18px 30px -22px rgba(0, 0, 0, 0.45)",
                backgroundColor: "lightgray"
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
                  {benefitsPrimaryList.map((benefit) => (
                    <li key={benefit._key || benefit.title} sx={{ mb: "1rem" }}>
                      <Text
                        as="span"
                        sx={{
                          fontWeight: "700",
                          color: "text",
                          fontSize: ["22px", "24px", "26px"]
                        }}
                      >
                        {benefit.title}
                      </Text>
                      {benefit.description ? (
                        <Text as="span" sx={{ color: "darkgray" }}>
                          {` — ${benefit.description}`}
                        </Text>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Box>

              <Box
                sx={{
                  minHeight: ["220px", "260px", "320px"],
                  flex: "1 1 45%",
                  position: "relative",
                  backgroundColor: "lightgray",
                  clipPath: [
                    "none",
                    "none",
                    "polygon(12% 0, 100% 0, 100% 100%, 0 100%)"
                  ]
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    "&:hover .image-layer": {
                      filter: "grayscale(100%)"
                    },
                    "&:hover .image-tint": {
                      opacity: 0.55
                    }
                  }}
                >
                  <Box
                    className="image-layer"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: "url(/images/join1.jpg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "grayscale(0%)",
                      transition: "filter 0.2s ease"
                    }}
                  />
                  <Box
                    className="image-tint"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(30, 148, 255, 0.55)",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                      pointerEvents: "none"
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(140deg, rgba(6, 59, 122, 0.2), rgba(6, 59, 122, 0))",
                    pointerEvents: "none"
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
                boxShadow: "0 18px 30px -22px rgba(0, 0, 0, 0.45)",
                backgroundColor: "lightgray"
              }}
            >
              <Box
                sx={{
                  minHeight: ["220px", "260px", "300px"],
                  flex: "1 1 45%",
                  position: "relative",
                  backgroundColor: "lightgray",
                  clipPath: [
                    "none",
                    "none",
                    "polygon(0 0, 100% 0, 88% 100%, 0 100%)"
                  ]
                }}
              >
                <Box
                  data-tooltip="M car day"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    "&:hover .image-layer": {
                      filter: "grayscale(100%)"
                    },
                    "&:hover .image-tint": {
                      opacity: 0.55
                    },
                    "&:hover::after": {
                      opacity: 1,
                      transform: "translateY(-6px)"
                    },
                    "&::after": {
                      content: "attr(data-tooltip)",
                      position: "absolute",
                      left: "12px",
                      bottom: "12px",
                      backgroundColor: "rgba(6, 59, 122, 0.92)",
                      color: "white",
                      fontSize: "12px",
                      letterSpacing: "0.02em",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      opacity: 0,
                      transform: "translateY(0)",
                      transition: "opacity 0.2s ease, transform 0.2s ease",
                      pointerEvents: "none",
                      maxWidth: "90%",
                      zIndex: 2
                    }
                  }}
                >
                  <Box
                    className="image-layer"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: "url(/images/join3.jpg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center bottom",
                      filter: "grayscale(0%)",
                      transition: "filter 0.2s ease"
                    }}
                  />
                  <Box
                    className="image-tint"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(30, 148, 255, 0.55)",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                      pointerEvents: "none"
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(160deg, rgba(6, 59, 122, 0.15), rgba(6, 59, 122, 0))",
                    pointerEvents: "none"
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
                  {benefitsSecondaryList.map((benefit) => (
                    <li key={benefit._key || benefit.title} sx={{ mb: "1rem" }}>
                      <Text
                        as="span"
                        sx={{
                          fontWeight: "700",
                          color: "text",
                          fontSize: ["22px", "24px", "26px"]
                        }}
                      >
                        {benefit.title}
                      </Text>
                      {benefit.description ? (
                        <Text as="span" sx={{ color: "darkgray" }}>
                          {` — ${benefit.description}`}
                        </Text>
                      ) : null}
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
          </ContentContainer>
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
    joinPage: sanityPage(_id: { regex: "/(drafts.|)join/" }) {
      joinHero {
        label
        heading
        subheading
      }
      joinEventHighlightsIntro
      joinHpdeSection {
        heading
        subheading
        subtext
        columns
        items {
          title
          details
        }
      }
      joinSocialSection {
        heading
        subheading
        subtext
        columns
        items {
          title
          details
        }
      }
      joinBenefitsPrimary {
        title
        description
      }
      joinBenefitsSecondary {
        title
        description
      }
      joinBenefitsIntro
    }
  }
`;

export default QrLandingPage;
