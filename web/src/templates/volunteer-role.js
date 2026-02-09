/** @jsxImportSource theme-ui */
import React from "react";
import { graphql, Link } from "gatsby";
import { Box, Card, Flex, Heading, Text } from "@theme-ui/components";
import { format, parseISO } from "date-fns";
import GraphQLErrorList from "../components/graphql-error-list";
import Seo from "../components/seo";
import Layout from "../containers/layout";
import ContentContainer from "../components/content-container";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import { BoxIcon } from "../components/box-icons";
import { FiHelpCircle } from "react-icons/fi";
import { getVolunteerRoleUrl, mapEdgesToNodes } from "../lib/helpers";

const normalizeImageUrl = (value) => {
  if (!value) return null;
  if (value.startsWith("//")) return `https:${value}`;
  return value;
};

const formatDate = (value) => {
  if (!value) return null;
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch (_) {
    return null;
  }
};

const formatDateRange = (start, end) => {
  const startLabel = formatDate(start);
  const endLabel = formatDate(end);
  if (!startLabel) return null;
  if (!endLabel || endLabel === startLabel) return startLabel;
  return `${startLabel} – ${endLabel}`;
};

const formatSkillLevel = (value) => {
  if (!value) return null;
  const normalized = String(value).toLowerCase();
  if (normalized === "entry") return "Entry";
  if (normalized === "medium") return "Medium";
  if (normalized === "high") return "High";
  return value;
};

const getSkillTone = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "entry") return { bg: "lightgray", color: "text" };
  if (normalized === "medium") return { bg: "secondary", color: "white" };
  if (normalized === "high") return { bg: "primary", color: "white" };
  return { bg: "lightgray", color: "text" };
};

const formatVolunteerPoints = (value) => {
  if (value === undefined || value === null) return null;
  const count = Math.max(0, Math.min(5, Number(value)));
  const stars = count > 0 ? "★".repeat(count) : "";
  const label = `${count} Point${count === 1 ? "" : "s"}`;
  return stars ? `${stars} ${label}` : label;
};

export const query = graphql`
  query VolunteerRoleTemplateQuery($id: String!) {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    role: sanityVolunteerRole(id: { eq: $id }) {
      id
      title
      slug {
        current
      }
      active
      workDescription
      date
      duration
      compensation
      volunteerPoints
      skillLevel
      membershipRequired
      descriptionPdf {
        asset {
          url
        }
      }
      category {
        title
      }
      motorsportRegEvent {
        eventId
        name
        start
        end
        url
        imageUrl
        venueName
        venueCity
        venueRegion
      }
    }
    otherRoles: allSanityVolunteerRole(
      filter: {
        id: { ne: $id }
        slug: { current: { ne: null } }
        active: { eq: true }
      }
      sort: { fields: [date], order: ASC }
      limit: 3
    ) {
      edges {
        node {
          id
          title
          slug {
            current
          }
          date
          motorsportRegEvent {
            name
            start
            imageUrl
          }
        }
      }
    }
  }
`;

const VolunteerRoleTemplate = (props) => {
  const { data, errors } = props;
  const site = data?.site;
  const role = data?.role;
  const otherRoles = data?.otherRoles ? mapEdgesToNodes(data.otherRoles) : [];
  const menuItems = site?.navMenu?.items || [];

  if (errors) {
    return (
      <Layout>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  if (!role) {
    return (
      <Layout navMenuItems={menuItems}>
        <ContentContainer sx={{ pt: "8rem", pb: "3rem" }}>
          <Heading as="h1" sx={{ variant: "styles.h2" }}>
            Volunteer role not found
          </Heading>
          <Text sx={{ color: "darkgray", mt: "0.5rem" }}>
            This volunteer role is no longer available.
          </Text>
          <Link to="/volunteer" sx={{ mt: "1rem", display: "inline-block" }}>
            Back to volunteer roles
          </Link>
        </ContentContainer>
      </Layout>
    );
  }

  const event = role?.motorsportRegEvent;
  const eventDateRange = formatDateRange(event?.start, event?.end);
  const roleDate = formatDate(role?.date);
  const imageUrl = normalizeImageUrl(event?.imageUrl);
  const venueLine = [event?.venueName, event?.venueCity, event?.venueRegion]
    .filter(Boolean)
    .join(", ");
  const showOtherRoles = otherRoles.length > 0;
  const skillLevelLabel = formatSkillLevel(role?.skillLevel);
  const skillTone = getSkillTone(role?.skillLevel);
  const pointsLabel = formatVolunteerPoints(role?.volunteerPoints);
  const valueTextSize = "xs";

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo title={role.title || "Volunteer role"} description={role.workDescription || ""} />
      <ContentContainer
        sx={{
          pl: ["16px", "16px", "50px", "100px"],
          pr: ["16px", "16px", "50px", "100px"],
          pt: ["6.5rem", "6.5rem", "10rem", "10rem"],
          pb: "2rem",
        }}
      >
        <Link to="/volunteer" sx={{ color: "text", textDecoration: "none" }}>
          ← Back to volunteer roles
        </Link>
        <Heading as="h1" sx={{ variant: "styles.h1", mt: "1rem", mb: "0.5rem" }}>
          {role.title}
          <BoxIcon
            as="span"
            sx={{
              display: "inline-grid",
              ml: "0.5rem",
              verticalAlign: "middle"
            }}
          />
        </Heading>
        {event?.name && (
          <Text sx={{ fontSize: "sm", color: "darkgray" }}>{event.name}</Text>
        )}
        <Flex
          sx={{
            mt: "2rem",
            gap: "1.5rem",
            flexDirection: ["column", "column", "row", "row"]
          }}
        >
          <Box sx={{ flex: ["1 1 100%", "1 1 100%", "1 1 45%"] }}>
            {imageUrl && (
              <Box
                as="img"
                src={imageUrl}
                alt={event?.name || role.title}
                sx={{
                  width: "100%",
                  height: ["220px", "260px", "320px"],
                  objectFit: "cover",
                  borderRadius: "18px",
                  mb: "1rem"
                }}
              />
            )}
            <Card sx={{ p: "1.25rem", borderRadius: "18px", border: "1px solid" }}>
              <Text sx={{ variant: "text.label", color: "darkgray" }}>Event details</Text>
              <Heading as="h2" sx={{ variant: "styles.h3", mt: "0.5rem" }}>
                {event?.name || "MotorsportReg event"}
              </Heading>
              {eventDateRange && (
                <Text as="div" sx={{ fontSize: "sm", color: "gray", mt: "0.5rem" }}>
                  {eventDateRange}
                </Text>
              )}
              {venueLine && (
                <Text as="div" sx={{ fontSize: "sm", color: "gray", mt: "0.25rem" }}>
                  {venueLine}
                </Text>
              )}
              {event?.url && (
                <OutboundLink
                  href={event.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  sx={{
                    mt: "0.75rem",
                    display: "inline-block",
                    textDecoration: "none",
                    color: "primary",
                    fontWeight: 600,
                    fontSize: "sm"
                  }}
                >
                  Open event in MSR →
                </OutboundLink>
              )}
            </Card>
          </Box>
          <Card
            sx={{
              flex: ["1 1 100%", "1 1 100%", "1 1 55%"],
              p: "1.5rem",
              borderRadius: "18px",
              border: "1px solid"
            }}
          >
            <Heading as="h2" sx={{ variant: "styles.h3" }}>
              Role details
            </Heading>
            <Box
              as="dl"
              sx={{
                mt: "0.75rem",
                display: "grid",
                gridTemplateColumns: ["1fr", "1fr", "150px 1fr"],
                columnGap: "1rem",
                rowGap: "0.5rem",
                "& dt": {
                  m: 0,
                  fontSize: "xs",
                  color: "darkgray",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase"
                },
                "& dd": {
                  m: 0,
                  fontSize: valueTextSize,
                  color: "text"
                }
              }}
            >
              {role?.category?.title && (
                <>
                  <Box as="dt">Category</Box>
                  <Box as="dd">{role.category.title}</Box>
                </>
              )}
              {skillLevelLabel && (
                <>
                  <Box as="dt">
                    Skill level{" "}
                    <Link
                      to="/volunteer/overview"
                      sx={{
                        color: "white",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        ml: "0.25rem",
                        width: "20px",
                        height: "20px",
                        justifyContent: "center",
                        borderRadius: "999px",
                        backgroundColor: "primary",
                        "&:hover": {
                          backgroundColor: "secondary",
                          color: "white"
                        }
                      }}
                    >
                      <FiHelpCircle size={16} />
                    </Link>
                  </Box>
                  <Box as="dd">
                    <Box
                      as="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        px: "0.6rem",
                        py: "0.2rem",
                        borderRadius: "999px",
                        fontSize: valueTextSize,
                        fontWeight: "heading",
                        bg: skillTone.bg,
                        color: skillTone.color
                      }}
                    >
                      {skillLevelLabel}
                    </Box>
                  </Box>
                </>
              )}
              {role?.membershipRequired !== undefined && role?.membershipRequired !== null && (
                <>
                  <Box as="dt">Membership required</Box>
                  <Box as="dd">{role.membershipRequired ? "Yes" : "No"}</Box>
                </>
              )}
              {pointsLabel && (
                <>
                  <Box as="dt">
                    Volunteer points{" "}
                    <Link
                      to="/volunteer/rewards"
                      sx={{
                        color: "white",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        ml: "0.25rem",
                        width: "20px",
                        height: "20px",
                        justifyContent: "center",
                        borderRadius: "999px",
                        backgroundColor: "primary",
                        "&:hover": {
                          backgroundColor: "secondary",
                          color: "white"
                        }
                      }}
                    >
                      <FiHelpCircle size={16} />
                    </Link>
                  </Box>
                  <Box as="dd">
                    <Box
                      as="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        px: "0.6rem",
                        py: "0.2rem",
                        borderRadius: "999px",
                        fontSize: valueTextSize,
                        fontWeight: "heading",
                        bg: "lightgray",
                        color: "text"
                      }}
                    >
                      {pointsLabel}
                    </Box>
                  </Box>
                </>
              )}
              {roleDate && (
                <>
                  <Box as="dt">Date</Box>
                  <Box as="dd">{roleDate}</Box>
                </>
              )}
              {role?.duration && (
                <>
                  <Box as="dt">Duration</Box>
                  <Box as="dd">{role.duration} hours</Box>
                </>
              )}
              {role?.compensation && (
                <>
                  <Box as="dt">Compensation</Box>
                  <Box as="dd">{role.compensation}</Box>
                </>
              )}
              {role?.workDescription && (
                <>
                  <Box as="dt">Description</Box>
                  <Box as="dd" sx={{ lineHeight: "body" }}>
                    {role.workDescription}
                  </Box>
                </>
              )}
            </Box>
            {role?.descriptionPdf?.asset?.url && (
              <Box sx={{ mt: "1.5rem" }}>
                <Text sx={{ variant: "text.label", color: "darkgray" }}>
                  Role PDF
                </Text>
                <Box
                  as="iframe"
                  title="Volunteer role PDF"
                  src={role.descriptionPdf.asset.url}
                  sx={{
                    width: "100%",
                    height: ["260px", "320px", "360px"],
                    border: "1px solid",
                    borderColor: "lightgray",
                    borderRadius: "12px",
                    mt: "0.75rem"
                  }}
                />
                <OutboundLink
                  href={role.descriptionPdf.asset.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  sx={{
                    mt: "0.75rem",
                    display: "inline-block",
                    textDecoration: "none",
                    color: "primary",
                    fontWeight: 600,
                    fontSize: "sm"
                  }}
                >
                  Open PDF in new tab →
                </OutboundLink>
              </Box>
            )}
          </Card>
        </Flex>
      </ContentContainer>
      {showOtherRoles && (
        <Box sx={{ backgroundColor: "lightgray", py: ["2rem", "2.5rem", "3rem"], mt: ["2rem", "2.5rem", "3rem"] }}>
          <ContentContainer
            sx={{
              pl: ["16px", "16px", "50px", "100px"],
              pr: ["16px", "16px", "50px", "100px"],
              pb: ["2rem", "2.5rem", "3rem"]
            }}
          >
            <Heading sx={{ variant: "styles.h3", mb: "1.25rem" }}>
              Other Roles
            </Heading>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: ["1fr", "repeat(2, minmax(0, 1fr))"],
                gap: "1.5rem"
              }}
            >
              {otherRoles.map((otherRole) => {
                const otherDate = otherRole?.motorsportRegEvent?.start;
                const otherDateLabel = otherDate ? formatDate(otherDate) : null;
                const otherImage = normalizeImageUrl(otherRole?.motorsportRegEvent?.imageUrl);
                const otherEventName = otherRole?.motorsportRegEvent?.name;
                const roleUrl = otherRole?.slug?.current
                  ? getVolunteerRoleUrl(otherRole.slug.current)
                  : null;
                const cardProps = roleUrl ? { as: Link, to: roleUrl } : {};
                return (
                  <Card
                    key={otherRole.id}
                    {...cardProps}
                    sx={{
                      textDecoration: "none",
                      color: "text",
                      borderRadius: "18px",
                      border: "1px solid",
                      borderColor: "black",
                      overflow: "hidden",
                      backgroundColor: "background",
                      display: "block",
                      boxShadow: "0 14px 30px rgba(0,0,0,0.18)"
                    }}
                  >
                    {otherImage && (
                      <Box
                        as="img"
                        src={otherImage}
                        alt={otherRole.title}
                        sx={{
                          width: "100%",
                          height: "180px",
                          objectFit: "cover",
                          display: "block"
                        }}
                      />
                    )}
                    <Box sx={{ p: "1rem" }}>
                      <Heading as="h3" sx={{ variant: "styles.h4", mt: "0.35rem" }}>
                        {otherRole.title}
                      </Heading>
                      {otherEventName && (
                        <Text
                          as="div"
                          sx={{ fontSize: "sm", color: "gray", mt: "0.35rem" }}
                        >
                          {otherEventName}
                        </Text>
                      )}
                      {otherDateLabel && (
                        <Text
                          as="div"
                          sx={{ fontSize: "xs", color: "darkgray", mt: "0.35rem" }}
                        >
                          {otherDateLabel}
                        </Text>
                      )}
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </ContentContainer>
        </Box>
      )}
    </Layout>
  );
};

export default VolunteerRoleTemplate;
