/** @jsxImportSource theme-ui */
import React, { useMemo } from "react";
import { graphql, Link } from "gatsby";
import { Box, Heading, Text } from "@theme-ui/components";
import Layout from "../../containers/layout";
import Seo from "../../components/seo";
import GraphQLErrorList from "../../components/graphql-error-list";
import ContentContainer from "../../components/content-container";
import { BoxIcon } from "../../components/box-icons";
import { mapEdgesToNodes } from "../../lib/helpers";

export const query = graphql`
  query VolunteerRolesPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    roles: allSanityVolunteerFixedRole(
      sort: { fields: [pointValue, name], order: [ASC, ASC] }
    ) {
      edges {
        node {
          id
          name
          description
          detail
          pointValue
        }
      }
    }
  }
`;

const formatPointLabel = (value) => {
  if (value === undefined || value === null) return "Unassigned";
  return `${value} Point${value === 1 ? "" : "s"}`;
};

const getRoleCapColor = (pointValue) => {
  const value = Number(pointValue);
  if (!Number.isFinite(value)) return "#444444";
  if (value >= 10) return "#000000";
  if (value >= 5) return "#0b4779";
  if (value >= 4) return "#0f5898";
  if (value >= 3) return "#146bba";
  if (value >= 2) return "#197fdd";
  return "#1e94ff";
};

const VolunteerRolesPage = ({ data, errors }) => {
  const site = data?.site;
  const menuItems = site?.navMenu?.items || [];
  const roles = useMemo(
    () => (data?.roles ? mapEdgesToNodes(data.roles) : []),
    [data?.roles]
  );

  const groupedRoles = useMemo(() => {
    const groups = new Map();
    roles.forEach((role) => {
      const key = role?.pointValue ?? "unassigned";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(role);
    });
    return Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === "unassigned") return 1;
      if (b[0] === "unassigned") return -1;
      return Number(a[0]) - Number(b[0]);
    });
  }, [roles]);

  if (errors) {
    return (
      <Layout navMenuItems={menuItems}>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo title="Volunteer Roles" />
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
            Roles
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
          Volunteer Roles
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
            mb: "1.75rem",
            maxWidth: "860px",
          }}
        >
          These are the fixed role types used when creating volunteer positions.{" "}
          Roles are grouped by point value to align with the{" "}
          <Link
            to="/volunteer/rewards"
            sx={{
              color: "primary",
              textDecoration: "none",
              "&:hover": { color: "secondary" },
            }}
          >
            Volunteer Rewards Program
          </Link>
          .
        </Text>

        {groupedRoles.length === 0 && (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "lightgray",
              borderRadius: "14px",
              p: "1rem",
              color: "darkgray",
            }}
          >
            No roles have been added in Sanity yet.
          </Box>
        )}

        <Box sx={{ mt: "0.85rem" }}>
          {groupedRoles.map(([pointValue, roles]) => (
            <Box key={`role-group-${pointValue}`} sx={{ mb: "1.5rem" }}>
              <Heading
                as="h2"
                sx={{ variant: "styles.h3", mt: 0, mb: "0.65rem" }}
              >
                {formatPointLabel(pointValue)}
              </Heading>
              <Box
                sx={{
                  height: "3px",
                  backgroundColor: "text",
                  mb: "0.75rem",
                }}
              />
              <Box sx={{ display: "grid", gap: "0.75rem" }}>
                {roles.map((role) => {
                  const descriptionText = role?.description?.trim() || "";
                  const detailText = role?.detail?.trim() || "";
                  const showDescription = Boolean(descriptionText);
                  const showDetail =
                    Boolean(detailText) && detailText !== descriptionText;
                  return (
                    <Box
                      key={role.id}
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "black",
                        borderRadius: "12px",
                        p: ["0.9rem", "1rem", "1.1rem"],
                        pt: ["1.75rem", "1.85rem", "1.95rem"],
                        bg: "background",
                      }}
                    >
                      <Box
                        as="span"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "18px",
                          backgroundColor: getRoleCapColor(pointValue),
                        }}
                      />
                      <Heading
                        as="h3"
                        sx={{ variant: "styles.h4", mt: 0, mb: "0.35rem" }}
                      >
                        {role?.name?.trim() || "Untitled role"}
                      </Heading>
                      <Box
                        sx={{
                          height: "1px",
                          backgroundColor: "lightgray",
                          mb: "0.55rem",
                        }}
                      />
                      {showDescription && (
                        <>
                          <Text
                            as="div"
                            sx={{
                              variant: "text.label",
                              color: "darkgray",
                              fontSize: "xxs",
                              mb: "0.3rem",
                            }}
                          >
                            Description
                          </Text>
                          <Text
                            sx={{
                              variant: "styles.p",
                              color: "text",
                              mb: showDetail ? "0.55rem" : 0,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {descriptionText}
                          </Text>
                        </>
                      )}
                      {showDetail && (
                        <>
                          <Text
                            as="div"
                            sx={{
                              variant: "text.label",
                              color: "darkgray",
                              fontSize: "xxs",
                              mb: "0.3rem",
                              mt: "0.2rem",
                            }}
                          >
                            Detail
                          </Text>
                          <Text
                            sx={{
                              variant: "styles.p",
                              color: "text",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {detailText}
                          </Text>
                        </>
                      )}
                      {!showDescription && !showDetail && (
                        <Text
                          sx={{ variant: "styles.p", color: "darkgray", mb: 0 }}
                        >
                          No description available.
                        </Text>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </ContentContainer>
    </Layout>
  );
};

export default VolunteerRolesPage;
