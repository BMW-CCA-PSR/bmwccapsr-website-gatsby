/** @jsxImportSource theme-ui */
import React, { useEffect, useMemo, useState } from "react";
import { Link, graphql } from "gatsby";
import { Box, Button, Card, Flex, Heading, Text } from "@theme-ui/components";
import { format, parseISO } from "date-fns";
import GraphQLErrorList from "../components/graphql-error-list";
import Seo from "../components/seo";
import Layout from "../containers/layout";
import ContentContainer from "../components/content-container";
import { BoxIcon } from "../components/box-icons";
import CategoryFilterButtons from "../components/category-filter-buttons";
import { Client } from "../services/FetchClient";
import { getVolunteerRoleUrl, mapEdgesToNodes } from "../lib/helpers";
import { FiArrowRight } from "react-icons/fi";

export const query = graphql`
  query VolunteerPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    roles: allSanityVolunteerRole(sort: { fields: [date], order: ASC }) {
      edges {
        node {
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
      }
    }
  }
`;

const buildPaginationItems = (current, total, delta = 2) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => ({
      type: "page",
      value: i + 1
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

const normalizeImageUrl = (value) => {
  if (!value) return null;
  if (value.startsWith("//")) return `https:${value}`;
  return value;
};

const sortVolunteerRoles = (items) => {
  const list = Array.isArray(items) ? [ ...items ] : [];
  const getSortValue = (role) => {
    const value = role?.date || role?.motorsportRegEvent?.start;
    if (!value) return null;
    const parsed = parseISO(value);
    if (Number.isNaN(parsed?.getTime?.())) return null;
    return parsed.getTime();
  };
  return list.sort((a, b) => {
    const aValue = getSortValue(a);
    const bValue = getSortValue(b);
    if (aValue === null && bValue === null) {
      const aKey = a?.id || a?._id || "";
      const bKey = b?.id || b?._id || "";
      return aKey.localeCompare(bKey);
    }
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    if (aValue !== bValue) return aValue - bValue;
    const aKey = a?.id || a?._id || "";
    const bKey = b?.id || b?._id || "";
    return aKey.localeCompare(bKey);
  });
};

const VolunteerPage = (props) => {
  const { data, errors } = props;
  const roleNodes = useMemo(
    () =>
      ((data || {}).roles ? sortVolunteerRoles(mapEdgesToNodes(data.roles)) : []),
    [data]
  );
  const sanity = useMemo(() => new Client(), []);
  const [roles, setRoles] = useState(roleNodes);
  const [isLoading, setIsLoading] = useState(roleNodes.length === 0);
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]);

  const site = (data || {}).site;
  const menuItems = site?.navMenu?.items || [];
  const activeRoles = roles.filter((role) => role?.active !== false);
  const categories = useMemo(() => {
    const unique = new Set();
    activeRoles.forEach((role) => {
      if (role?.category?.title) unique.add(role.category.title);
    });
    const sorted = Array.from(unique).sort((a, b) => a.localeCompare(b));
    return ["All", ...sorted];
  }, [activeRoles]);
  const venues = useMemo(() => {
    const unique = new Set();
    activeRoles.forEach((role) => {
      const venueName = role?.motorsportRegEvent?.venueName;
      if (venueName) unique.add(venueName);
    });
    const sorted = Array.from(unique).sort((a, b) => a.localeCompare(b));
    return ["All", ...sorted];
  }, [activeRoles]);
  const pointOptions = useMemo(() => {
    const unique = new Set();
    activeRoles.forEach((role) => {
      if (role?.volunteerPoints !== undefined && role?.volunteerPoints !== null) {
        unique.add(role.volunteerPoints);
      }
    });
    const sorted = Array.from(unique).sort((a, b) => a - b);
    const labeled = sorted.map((value) => ({
      value,
      label: `${value} pt${value === 1 ? "" : "s"}`
    }));
    return ["All", ...labeled];
  }, [activeRoles]);
  const pointLabels = useMemo(() => {
    const map = new Map();
    pointOptions.forEach((option) => {
      if (option && typeof option === "object") {
        map.set(option.value, option.label || option.value);
      }
    });
    return map;
  }, [pointOptions]);
  const filterLabelParts = [];
  if (selectedCategories.length) {
    filterLabelParts.push(selectedCategories.join(", "));
  }
  if (selectedVenues.length) {
    filterLabelParts.push(selectedVenues.join(", "));
  }
  if (selectedPoints.length) {
    const pointLabelText = selectedPoints
      .map((value) => pointLabels.get(value) || value)
      .join(", ");
    filterLabelParts.push(pointLabelText);
  }
  const combinedFilterLabel = filterLabelParts.length
    ? filterLabelParts.join(" · ")
    : "All";
  const allFiltersActive =
    selectedCategories.length === 0 &&
    selectedVenues.length === 0 &&
    selectedPoints.length === 0;
  const handleSelectAllFilters = () => {
    setSelectedCategories([]);
    setSelectedVenues([]);
    setSelectedPoints([]);
  };
  const filteredRoles = activeRoles.filter((role) => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(role?.category?.title);
  });
  const filteredByVenue = filteredRoles.filter((role) => {
    if (selectedVenues.length === 0) return true;
    return selectedVenues.includes(role?.motorsportRegEvent?.venueName);
  });
  const filteredByPoints = filteredByVenue.filter((role) => {
    if (selectedPoints.length === 0) return true;
    return selectedPoints.includes(role?.volunteerPoints);
  });
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredByPoints.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages);
  const paginatedRoles = filteredByPoints.slice(
    (safePageIndex - 1) * pageSize,
    safePageIndex * pageSize
  );
  const paginationItems = buildPaginationItems(safePageIndex, totalPages);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(roleNodes.length === 0);
    sanity
      .fetchVolunteerRoles()
      .then((data) => {
        if (!isMounted) return;
        setRoles(sortVolunteerRoles(Array.isArray(data) ? data : []));
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [sanity, roleNodes.length]);

  useEffect(() => {
    if (roleNodes.length && roles.length === 0) {
      setRoles(sortVolunteerRoles(roleNodes));
      setIsLoading(false);
    }
  }, [roleNodes, roles.length]);

  useEffect(() => {
    setPageIndex(1);
  }, [roles.length, selectedCategories, selectedVenues, selectedPoints]);

  if (errors) {
    return (
      <Layout>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo
        title="Volunteer"
        description="Volunteer with BMW CCA Puget Sound Region."
      />
      <ContentContainer
        sx={{
          pl: ["16px", "16px", "50px", "100px"],
          pr: ["16px", "16px", "50px", "100px"],
          pt: ["6.5rem", "6.5rem", "10rem", "10rem"],
          pb: "2rem",
        }}
      >
        <Flex
          sx={{
            alignItems: ["flex-start", "flex-start", "flex-start"],
            justifyContent: "space-between",
            flexWrap: ["wrap", "wrap", "nowrap"],
            gap: "1rem",
            pb: "0.75rem"
          }}
        >
          <Box sx={{ maxWidth: "760px" }}>
            <Heading as="h1" sx={{ variant: "styles.h1", mb: "0.35rem", mt: 0 }}>
              Volunteer
              <BoxIcon
                as="span"
                sx={{
                  display: "inline-grid",
                  ml: "0.5rem",
                  verticalAlign: "middle"
                }}
              />
            </Heading>
            <Text sx={{ variant: "styles.p" }}>
              Volunteers are core to our club and critical to running and hosting
              large events. Explore open roles below and learn how to get involved.
            </Text>
          </Box>
          <Box
            sx={{
              display: "grid",
              gap: "0.5rem",
              width: ["100%", "100%", "300px"],
              justifyItems: ["start", "start", "end"],
              alignSelf: ["stretch", "stretch", "flex-start"]
            }}
          >
            <Link
              to="/volunteer/overview"
              sx={{ textDecoration: "none", width: "100%", display: "block" }}
            >
              <Card
                sx={{
                  width: "100%",
                  px: "1rem",
                  py: "0.65rem",
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "primary",
                  backgroundColor: "primary",
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  fontSize: "xs",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  "&:hover": {
                    backgroundColor: "secondary",
                    borderColor: "secondary",
                    color: "white"
                  }
                }}
              >
                <Text sx={{ fontSize: "xs", color: "inherit" }}>
                  Volunteering Overview
                </Text>
                <Box
                  as="span"
                  sx={{
                    width: "20px",
                    height: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 20px"
                  }}
                >
                  <FiArrowRight size={20} />
                </Box>
              </Card>
            </Link>
            <Link
              to="/volunteer/rewards"
              sx={{ textDecoration: "none", width: "100%", display: "block" }}
            >
              <Card
                sx={{
                  width: "100%",
                  px: "1rem",
                  py: "0.65rem",
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "primary",
                  backgroundColor: "primary",
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  fontSize: "xs",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  "&:hover": {
                    backgroundColor: "secondary",
                    borderColor: "secondary",
                    color: "white"
                  }
                }}
              >
                <Text sx={{ fontSize: "xs", color: "inherit" }}>
                  Rewards Program
                </Text>
                <Box
                  as="span"
                  sx={{
                    width: "20px",
                    height: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 20px"
                  }}
                >
                  <FiArrowRight size={20} />
                </Box>
              </Card>
            </Link>
          </Box>
        </Flex>
        <Heading sx={{ variant: "styles.h3", mt: "0.5rem" }}>
          Filter
        </Heading>
        <Box
          sx={{
            mt: "1rem",
            mb: "1.5rem",
            p: ["1rem", "1.25rem"],
            backgroundColor: "lightgray",
            borderRadius: "12px",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "flex-start"
          }}
        >
          <Box sx={{ flex: "1 1 100%" }}>
            <CategoryFilterButtons
              categories={categories}
              selectedCategories={selectedCategories}
              onChange={setSelectedCategories}
              allSelected={allFiltersActive}
              onSelectAll={handleSelectAllFilters}
              showDivider
            >
              <CategoryFilterButtons
                categories={venues}
                selectedCategories={selectedVenues}
                onChange={setSelectedVenues}
                showAll={false}
                showDivider
                layout="inline"
              >
                <CategoryFilterButtons
                  categories={pointOptions}
                  selectedCategories={selectedPoints}
                  onChange={setSelectedPoints}
                  showAll={false}
                  layout="inline"
                />
              </CategoryFilterButtons>
            </CategoryFilterButtons>
          </Box>
        </Box>
        <Flex
          sx={{
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            borderBottomStyle: "solid",
            pb: "3px",
            borderBottomWidth: "3px",
            my: "0.5rem"
          }}
        >
          <Heading sx={{ variant: "styles.h3", mb: 0 }}>
            Available roles — {combinedFilterLabel}
          </Heading>
          <a
            href="https://motorsportreg.com"
            target="_blank"
            rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", padding: 6 }}
          >
            <img
              src="https://msr-hotlink.s3.amazonaws.com/dark/msr-logo-dark@2x.png"
              alt="Online registration and event management service for motorsport events powered by MotorsportReg.com"
              title="Online registration and event management service for motorsport events powered by MotorsportReg.com"
              style={{ width: 200, height: 31, display: "block" }}
            />
          </a>
        </Flex>
        {paginatedRoles.length > 0 && (
          <Box sx={{ display: "grid", gap: "1.25rem" }}>
            {paginatedRoles.map((role) => {
              const imageUrl = normalizeImageUrl(
                role?.motorsportRegEvent?.imageUrl
              );
              const roleDate = role?.date || role?.motorsportRegEvent?.start;
              const formattedDate = roleDate
                ? format(parseISO(roleDate), "MMM d, yyyy")
                : null;
              const venueParts = [
                role?.motorsportRegEvent?.venueName,
                role?.motorsportRegEvent?.venueCity,
                role?.motorsportRegEvent?.venueRegion
              ].filter(Boolean);
              const venueLabel = venueParts.join(", ");
              const roleUrl = role?.slug?.current
                ? getVolunteerRoleUrl(role.slug.current)
                : null;
              const cardProps = roleUrl
                ? { as: Link, to: roleUrl }
                : {};
              return (
                <Card
                  key={role._id || role.id}
                  {...cardProps}
                  sx={{
                    width: "100%",
                    borderRadius: "18px",
                    border: "1px solid",
                    borderColor: "black",
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                    cursor: roleUrl ? "pointer" : "default",
                  }}
                >
                  <Flex
                    sx={{
                      flexDirection: ["column", "column", "row", "row"],
                      alignItems: ["stretch", "stretch", "stretch", "stretch"]
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        minHeight: ["240px", "280px", "auto"],
                        height: ["240px", "280px", "auto"],
                        alignSelf: "stretch",
                        flex: ["0 0 auto", "0 0 auto", "1 1 42%"],
                        borderRadius: ["0", "0", "18px 0 0 18px"],
                        overflow: "hidden",
                        clipPath: ["none", "none", "polygon(0 0, 100% 0, 88% 100%, 0 100%)"],
                        backgroundColor: "lightgray"
                      }}
                    >
                      {imageUrl && (
                        <Box
                          as="img"
                          src={imageUrl}
                          alt={role?.motorsportRegEvent?.name || role?.title || "Volunteer role"}
                          sx={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block"
                          }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        px: "1.5rem",
                        py: "1.5rem",
                        flex: ["1 1 100%", "1 1 100%", "1 1 60%"],
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem"
                      }}
                    >
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {role?.category?.title && (
                          <Text sx={{ variant: "text.label", color: "black" }}>
                            {role.category.title}
                          </Text>
                        )}
                        {role?.volunteerPoints !== undefined &&
                          role?.volunteerPoints !== null && (
                            <Text
                              sx={{
                                variant: "text.label",
                                color: "white",
                                bg: "primary",
                                px: 2,
                                py: 1,
                                borderRadius: 9999
                              }}
                            >
                              {role.volunteerPoints} pts
                            </Text>
                          )}
                      </Box>
                      <Heading as="h3" sx={{ variant: "styles.h3", mb: 0 }}>
                        {role.title}
                      </Heading>
                      {role?.motorsportRegEvent?.name && (
                        <Text sx={{ fontSize: "sm", color: "darkgray" }}>
                          {role.motorsportRegEvent.name}
                        </Text>
                      )}
                      {(venueLabel || formattedDate || role?.duration) && (
                        <Flex
                          sx={{
                            flexDirection: ["column", "column", "row"],
                            alignItems: ["flex-start", "flex-start", "center"],
                            gap: ["0.15rem", "0.15rem", "0.5rem"],
                            color: "gray",
                            fontSize: "xs"
                          }}
                        >
                          {venueLabel && <Text sx={{ fontSize: "inherit" }}>{venueLabel}</Text>}
                          {venueLabel && (formattedDate || role?.duration) && (
                            <Text
                              sx={{
                                fontSize: "inherit",
                                display: ["none", "none", "inline"]
                              }}
                            >
                              |
                            </Text>
                          )}
                          {(formattedDate || role?.duration) && (
                            <Text sx={{ fontSize: "inherit" }}>
                              {[formattedDate, role?.duration ? `${role.duration} hours` : null]
                                .filter(Boolean)
                                .join(" · ")}
                            </Text>
                          )}
                        </Flex>
                      )}
                    </Box>
                  </Flex>
                </Card>
              );
            })}
          </Box>
        )}
        {!isLoading && activeRoles.length === 0 && (
          <Box sx={{ mt: "1.5rem", color: "darkgray" }}>
            No volunteer roles are active right now.
          </Box>
        )}
        {!isLoading && activeRoles.length > 0 && paginatedRoles.length === 0 && (
          <Box sx={{ mt: "1.5rem", color: "darkgray" }}>
            No volunteer roles match those filters yet.
          </Box>
        )}
        {isLoading && (
          <Box sx={{ mt: "1.5rem", color: "darkgray" }}>
            Loading volunteer roles...
          </Box>
        )}
        {totalPages > 1 && (
          <Box
            sx={{
              mt: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.4rem"
            }}
          >
            <Button
              onClick={() => setPageIndex(Math.max(1, safePageIndex - 1))}
              disabled={safePageIndex === 1}
              sx={{
                variant: "buttons.primary",
                bg: safePageIndex === 1 ? "lightgray" : "background",
                color: safePageIndex === 1 ? "darkgray" : "text",
                border: "1px solid",
                borderColor: "gray",
                px: "0.9rem",
                py: "0.4rem",
                cursor: safePageIndex === 1 ? "not-allowed" : "pointer",
                "&:hover": {
                  bg: safePageIndex === 1 ? "lightgray" : "highlight",
                  color: safePageIndex === 1 ? "darkgray" : "text"
                }
              }}
            >
              Prev
            </Button>
            {paginationItems.map((item, index) => {
              if (item.type === "ellipsis") {
                return (
                  <Box
                    key={`pagination-ellipsis-${item.key}-${index}`}
                    sx={{
                      px: "0.6rem",
                      py: "0.4rem",
                      color: "gray",
                      alignSelf: "center"
                    }}
                  >
                    ...
                  </Box>
                );
              }
              const isActive = item.value === safePageIndex;
              return (
                <Button
                  key={`pagination-number-${item.value}`}
                  onClick={() => setPageIndex(item.value)}
                  sx={{
                    variant: "buttons.primary",
                    bg: isActive ? "primary" : "background",
                    color: isActive ? "white" : "text",
                    border: "1px solid",
                    borderColor: "gray",
                    px: "0.8rem",
                    py: "0.4rem",
                    minWidth: "42px",
                    "&:hover": {
                      bg: isActive ? "primary" : "highlight",
                      color: isActive ? "white" : "text"
                    }
                  }}
                >
                  {item.value}
                </Button>
              );
            })}
            <Button
              onClick={() => setPageIndex(Math.min(totalPages, safePageIndex + 1))}
              disabled={safePageIndex === totalPages}
              sx={{
                variant: "buttons.primary",
                bg: safePageIndex === totalPages ? "lightgray" : "background",
                color: safePageIndex === totalPages ? "darkgray" : "text",
                border: "1px solid",
                borderColor: "gray",
                px: "0.9rem",
                py: "0.4rem",
                cursor: safePageIndex === totalPages ? "not-allowed" : "pointer",
                "&:hover": {
                  bg: safePageIndex === totalPages ? "lightgray" : "highlight",
                  color: safePageIndex === totalPages ? "darkgray" : "text"
                }
              }}
            >
              Next
            </Button>
          </Box>
        )}
      </ContentContainer>
    </Layout>
  );
};

export default VolunteerPage;
