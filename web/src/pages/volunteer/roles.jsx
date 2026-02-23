/** @jsxImportSource theme-ui */
import React, { useEffect, useMemo, useState } from "react";
import { graphql, Link } from "gatsby";
import { Box, Button, Heading, Text } from "@theme-ui/components";
import {
  FaAward,
  FaBullhorn,
  FaCamera,
  FaCarSide,
  FaClipboardCheck,
  FaCogs,
  FaFlagCheckered,
  FaHandsHelping,
  FaHardHat,
  FaHeart,
  FaIdBadge,
  FaMapMarkerAlt,
  FaRoute,
  FaShieldAlt,
  FaTools,
  FaToolbox,
  FaUserPlus,
  FaUserAlt,
  FaUserCheck,
  FaUsers,
  FaWrench,
} from "react-icons/fa";
import Layout from "../../containers/layout";
import Seo from "../../components/seo";
import GraphQLErrorList from "../../components/graphql-error-list";
import ContentContainer from "../../components/content-container";
import { BoxIcon } from "../../components/box-icons";
import { mapEdgesToNodes } from "../../lib/helpers";
import { getVolunteerPointCapColor } from "../../lib/volunteerPointStyles";

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
          pointValue
        }
      }
    }
  }
`;

const PAGE_SIZE = 4;

const SKILL_TABS = [
  {
    key: "entry",
    label: "Entry",
    icon: FaUserPlus,
    points: [1, 2],
    bg: "#e8f7ec",
    hoverBg: "#d4f1dd",
    accent: "#1f7a3f",
  },
  {
    key: "intermediate",
    label: "Intermediate",
    icon: FaTools,
    points: [3, 4],
    bg: "#fff6d5",
    hoverBg: "#ffe9a6",
    accent: "#8b6b00",
  },
  {
    key: "advanced",
    label: "Advanced",
    icon: FaAward,
    points: [5, 10],
    bg: "#ffe6e6",
    hoverBg: "#ffd1d1",
    accent: "#9a1f1f",
  },
];

const buildPaginationItems = (current, total, delta = 1) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => ({
      type: "page",
      value: i + 1,
    }));
  }

  const items = [{ type: "page", value: 1 }];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  if (left > 2) {
    items.push({ type: "ellipsis", key: "left" });
  }

  for (let i = left; i <= right; i += 1) {
    items.push({ type: "page", value: i });
  }

  if (right < total - 1) {
    items.push({ type: "ellipsis", key: "right" });
  }

  items.push({ type: "page", value: total });
  return items;
};

const ROLE_ICON_RULES = [
  {
    pattern: /(marshal|grid|starter|flag|corner|control)/i,
    icon: FaFlagCheckered,
  },
  {
    pattern: /(instructor|coach|trainer|mentor)/i,
    icon: FaUserCheck,
  },
  {
    pattern: /(registration|check[- ]?in|admin|desk|sign[- ]?in)/i,
    icon: FaClipboardCheck,
  },
  { pattern: /(safety|medical|first aid)/i, icon: FaShieldAlt },
  { pattern: /(photographer|photo|media|video)/i, icon: FaCamera },
  { pattern: /(route|tour|drive leader|lead car|sweep)/i, icon: FaRoute },
  {
    pattern: /(communications|announc|pa|social|newsletter|content)/i,
    icon: FaBullhorn,
  },
  { pattern: /(tech|mechanic|inspection|garage)/i, icon: FaWrench },
  {
    pattern: /(pit|equipment|ops|operations|setup|teardown|logistics)/i,
    icon: FaToolbox,
  },
  { pattern: /(hospitality|welcome|host|greeter)/i, icon: FaHandsHelping },
  { pattern: /(car control|ccc|autocross|track|hpde|driving)/i, icon: FaCarSide },
  { pattern: /(coordinator|manager|lead)/i, icon: FaIdBadge },
  { pattern: /(venue|location|site)/i, icon: FaMapMarkerAlt },
  { pattern: /(worker|crew)/i, icon: FaHardHat },
  { pattern: /(member|membership)/i, icon: FaUsers },
  { pattern: /(support|assistant|helper)/i, icon: FaHeart },
];

const getRoleIcon = (name) => {
  const label = String(name || "").trim();
  if (!label) return FaUserAlt;
  const match = ROLE_ICON_RULES.find((rule) => rule.pattern.test(label));
  return match?.icon || FaCogs;
};

const getTabKeyForPoints = (value) => {
  const pointValue = Number(value);
  if (pointValue === 1 || pointValue === 2) return "entry";
  if (pointValue === 3 || pointValue === 4) return "intermediate";
  if (pointValue === 5 || pointValue === 10) return "advanced";
  return null;
};

const VolunteerRolesPage = ({ data, errors }) => {
  const site = data?.site;
  const menuItems = site?.navMenu?.items || [];
  const [activeTab, setActiveTab] = useState("entry");
  const [pageByTab, setPageByTab] = useState({
    entry: 1,
    intermediate: 1,
    advanced: 1,
  });

  const roles = useMemo(
    () => (data?.roles ? mapEdgesToNodes(data.roles) : []),
    [data?.roles]
  );

  const rolesBySkill = useMemo(() => {
    const grouped = {
      entry: [],
      intermediate: [],
      advanced: [],
    };

    roles.forEach((role) => {
      const tabKey = getTabKeyForPoints(role?.pointValue);
      if (!tabKey) return;
      grouped[tabKey].push(role);
    });

    return grouped;
  }, [roles]);

  const activeRoles = useMemo(
    () => rolesBySkill[activeTab] || [],
    [rolesBySkill, activeTab]
  );
  const totalPages = Math.max(1, Math.ceil(activeRoles.length / PAGE_SIZE));
  const activePage = pageByTab[activeTab] || 1;
  const safePage = Math.min(activePage, totalPages);

  useEffect(() => {
    if (activePage !== safePage) {
      setPageByTab((prev) => ({ ...prev, [activeTab]: safePage }));
    }
  }, [activePage, activeTab, safePage]);

  const paginatedRoles = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return activeRoles.slice(start, start + PAGE_SIZE);
  }, [activeRoles, safePage]);

  const paddedRoles = useMemo(() => {
    const blanks = Math.max(0, PAGE_SIZE - paginatedRoles.length);
    return [...paginatedRoles, ...Array.from({ length: blanks }, () => null)];
  }, [paginatedRoles]);

  const paginationItems = useMemo(
    () => buildPaginationItems(safePage, totalPages),
    [safePage, totalPages]
  );

  const currentTab = SKILL_TABS.find((tab) => tab.key === activeTab) || SKILL_TABS[0];

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const setPageForActiveTab = (nextPage) => {
    setPageByTab((prev) => ({ ...prev, [activeTab]: nextPage }));
  };

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

        {roles.length === 0 ? (
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
        ) : (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "black",
              borderRadius: "18px",
              bg: "background",
              overflow: "hidden",
              height: ["860px", "860px", "760px", "760px"],
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                borderBottom: "1px solid",
                borderBottomColor: "black",
              }}
            >
              {SKILL_TABS.map((tab) => {
                const isActive = tab.key === activeTab;
                const TabIcon = tab.icon;
                return (
                  <Button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    sx={{
                      appearance: "none",
                      border: "none",
                      borderRadius: 0,
                      p: ["0.85rem", "0.9rem", "1rem"],
                      display: "inline-flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "0.5rem",
                      bg: isActive ? tab.bg : "background",
                      color: isActive ? tab.accent : "text",
                      fontWeight: "heading",
                      borderBottom: "4px solid",
                      borderBottomColor: isActive ? tab.accent : "transparent",
                      borderRight: "1px solid",
                      borderRightColor: "black",
                      transition: "background-color 150ms ease, color 150ms ease",
                      ":last-of-type": {
                        borderRight: "none",
                      },
                      "&:hover": {
                        bg: isActive ? tab.bg : tab.hoverBg,
                        color: tab.accent,
                      },
                    }}
                  >
                    <TabIcon size={18} aria-hidden="true" />
                    <Text as="span" sx={{ fontSize: "sm", fontWeight: "heading" }}>
                      {tab.label}
                    </Text>
                  </Button>
                );
              })}
            </Box>

            <Box sx={{ px: ["0.75rem", "0.9rem", "1rem"], pt: "0.8rem", pb: "0.4rem" }}>
              <Text sx={{ variant: "text.label", color: "darkgray", mb: "0.15rem" }}>
                {currentTab.label} roles
              </Text>
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                px: ["0.75rem", "0.9rem", "1rem"],
                pb: ["0.75rem", "0.75rem", "0.9rem"],
                display: "flex",
                flexDirection: "column",
                gap: "0.8rem",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: "grid",
                  gridTemplateRows: `repeat(${PAGE_SIZE}, minmax(0, 1fr))`,
                  gap: "0.7rem",
                }}
              >
                {paddedRoles.map((role, index) => {
                  if (!role) {
                    return (
                      <Box
                        key={`empty-role-${activeTab}-${index}`}
                        sx={{
                          borderRadius: "12px",
                          border: "1px dashed",
                          borderColor: "lightgray",
                          bg: "rgba(0,0,0,0.01)",
                        }}
                      />
                    );
                  }

                  const roleName = role?.name?.trim() || "Untitled role";
                  const descriptionText = role?.description?.trim() || "No description available.";
                  const RoleIcon = getRoleIcon(roleName);
                  const pointValue = Number(role?.pointValue);
                  const pointLabel = Number.isFinite(pointValue)
                    ? `${pointValue} pt${pointValue === 1 ? "" : "s"}`
                    : "-";

                  return (
                    <Box
                      key={role.id}
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "black",
                        borderRadius: "12px",
                        p: ["0.75rem", "0.8rem", "0.9rem"],
                        pt: ["1.5rem", "1.55rem", "1.65rem"],
                        bg: "background",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                      }}
                    >
                      <Box
                        as="span"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "16px",
                          backgroundColor: getVolunteerPointCapColor(
                            role?.pointValue
                          ),
                        }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "0.75rem",
                          mb: "0.35rem",
                        }}
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            minWidth: 0,
                            flex: "1 1 auto",
                          }}
                        >
                          <Box
                            as="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "24px",
                              height: "24px",
                              borderRadius: "999px",
                              bg: "lightgray",
                              color: "text",
                              flex: "0 0 24px",
                            }}
                          >
                            <RoleIcon size={13} aria-hidden="true" />
                          </Box>
                          <Heading
                            as="h3"
                            sx={{
                              variant: "styles.h4",
                              mt: 0,
                              mb: 0,
                              minWidth: 0,
                              fontSize: ["1rem", "1rem", "1.05rem"],
                              lineHeight: 1.2,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {roleName}
                          </Heading>
                        </Box>

                        <Box
                          as="span"
                          sx={{
                            flex: "0 0 auto",
                            minWidth: "70px",
                            textAlign: "center",
                            px: "0.55rem",
                            py: "0.35rem",
                            borderRadius: "999px",
                            bg: currentTab.bg,
                            color: currentTab.accent,
                            fontWeight: "heading",
                            fontSize: "xs",
                            lineHeight: 1,
                            border: "1px solid",
                            borderColor: "rgba(0,0,0,0.2)",
                          }}
                        >
                          {pointLabel}
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          height: "1px",
                          backgroundColor: "lightgray",
                          mb: "0.45rem",
                        }}
                      />

                      <Text
                        sx={{
                          variant: "styles.p",
                          color: "text",
                          mb: 0,
                          fontSize: "0.95rem",
                          lineHeight: 1.35,
                          whiteSpace: "pre-line",
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {descriptionText}
                      </Text>
                    </Box>
                  );
                })}
              </Box>

              <Box
                sx={{
                  pt: "0.1rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.35rem",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  onClick={() => setPageForActiveTab(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  sx={{
                    variant: "buttons.primary",
                    bg: safePage === 1 ? "lightgray" : "background",
                    color: safePage === 1 ? "darkgray" : "text",
                    border: "1px solid",
                    borderColor: "gray",
                    px: "0.75rem",
                    py: "0.3rem",
                    minWidth: "64px",
                    cursor: safePage === 1 ? "not-allowed" : "pointer",
                    "&:hover": {
                      bg: safePage === 1 ? "lightgray" : "highlight",
                      color: safePage === 1 ? "darkgray" : "text",
                    },
                  }}
                >
                  Prev
                </Button>

                {paginationItems.map((item, index) => {
                  if (item.type === "ellipsis") {
                    return (
                      <Box
                        key={`roles-pagination-ellipsis-${item.key}-${index}`}
                        sx={{ px: "0.45rem", color: "gray", lineHeight: 1 }}
                      >
                        ...
                      </Box>
                    );
                  }

                  const isCurrent = item.value === safePage;
                  return (
                    <Button
                      key={`roles-pagination-number-${item.value}`}
                      onClick={() => setPageForActiveTab(item.value)}
                      sx={{
                        variant: "buttons.primary",
                        bg: isCurrent ? "primary" : "background",
                        color: isCurrent ? "white" : "text",
                        border: "1px solid",
                        borderColor: "gray",
                        px: "0.65rem",
                        py: "0.3rem",
                        minWidth: "38px",
                        "&:hover": {
                          bg: isCurrent ? "primary" : "highlight",
                          color: isCurrent ? "white" : "text",
                        },
                      }}
                    >
                      {item.value}
                    </Button>
                  );
                })}

                <Button
                  onClick={() => setPageForActiveTab(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                  sx={{
                    variant: "buttons.primary",
                    bg: safePage === totalPages ? "lightgray" : "background",
                    color: safePage === totalPages ? "darkgray" : "text",
                    border: "1px solid",
                    borderColor: "gray",
                    px: "0.75rem",
                    py: "0.3rem",
                    minWidth: "64px",
                    cursor: safePage === totalPages ? "not-allowed" : "pointer",
                    "&:hover": {
                      bg: safePage === totalPages ? "lightgray" : "highlight",
                      color: safePage === totalPages ? "darkgray" : "text",
                    },
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </ContentContainer>
    </Layout>
  );
};

export default VolunteerRolesPage;
