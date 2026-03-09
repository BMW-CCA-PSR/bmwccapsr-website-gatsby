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
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";
import { FiArrowRight } from "react-icons/fi";
import {
  FaAward,
  FaBullhorn,
  FaCalendarAlt,
  FaCamera,
  FaCarSide,
  FaClipboardCheck,
  FaClipboardList,
  FaCogs,
  FaFlagCheckered,
  FaHandsHelping,
  FaHardHat,
  FaHeart,
  FaIdBadge,
  FaRoute,
  FaShieldAlt,
  FaStar,
  FaToolbox,
  FaTools,
  FaUserAlt,
  FaUserCheck,
  FaUserPlus,
  FaUsers,
  FaWrench,
} from "react-icons/fa";
import { getVolunteerPointCapColor } from "../lib/volunteerPointStyles";

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
          role {
            name
            description
            detail
            pointValue
          }
          slug {
            current
          }
          active
          date
          duration
          compensation
          skillLevel
          membershipRequired
          descriptionPdf {
            asset {
              url
            }
          }
          motorsportRegEvent {
            origin
            eventId
            sanityEventId
            name
            start
            end
            url
            imageUrl
            venueName
            venueCity
            venueRegion
            eventType
            registrationStart
            registrationEnd
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

const normalizeImageUrl = (value) => {
  if (!value) return null;
  if (value.startsWith("//")) return `https:${value}`;
  return value;
};

const parseCalendarDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const toDateToken = (value) => {
  if (!value) return null;
  return String(value).slice(0, 10);
};

const sortVolunteerRoles = (items) => {
  const list = Array.isArray(items) ? [...items] : [];
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

const getPositionTitle = (position) =>
  position?.role?.name || position?.title || "Volunteer position";

const toTitleCaseWords = (value) =>
  String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      /^[A-Z0-9]+$/.test(word)
        ? word
        : `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`,
    )
    .join(" ");

const formatRoleFilterLabel = (roleName) => {
  const input = String(roleName || "").trim();
  if (!input) return "";
  const match = input.match(/^[^(]*\(([^)]+)\)\s*(.*)$/);
  if (!match) return input;
  const shortLabel = String(match[1] || "").trim();
  const suffix = String(match[2] || "").trim();
  if (!shortLabel) return input;
  if (!suffix) return shortLabel;
  return `${shortLabel} ${toTitleCaseWords(suffix)}`;
};

const ROLE_CARD_ICON_RULES = [
  {
    pattern: /(marshal|grid|starter|flag|corner|control)/i,
    icon: FaFlagCheckered,
  },
  { pattern: /(instructor|coach|trainer|mentor)/i, icon: FaUserCheck },
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
  {
    pattern: /(car control|ccc|autocross|track|hpde|driving)/i,
    icon: FaCarSide,
  },
  { pattern: /(coordinator|manager|lead)/i, icon: FaIdBadge },
  { pattern: /(worker|crew)/i, icon: FaHardHat },
  { pattern: /(member|membership)/i, icon: FaUsers },
  { pattern: /(support|assistant|helper)/i, icon: FaHeart },
];

const getRoleCardIcon = (roleName) => {
  const label = String(roleName || "").trim();
  if (!label) return FaUserAlt;
  const match = ROLE_CARD_ICON_RULES.find((rule) => rule.pattern.test(label));
  return match?.icon || FaCogs;
};

const formatSkillLevel = (value) => {
  if (!value) return null;
  const normalized = String(value).toLowerCase();
  if (normalized === "entry") return "Entry";
  if (normalized === "medium" || normalized === "intermediate")
    return "Intermediate";
  if (
    normalized === "high" ||
    normalized === "hard" ||
    normalized === "advanced"
  )
    return "Advanced";
  return null;
};

const getSkillTone = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "entry") return { bg: "#e8f7ec", color: "text" };
  if (normalized === "medium" || normalized === "intermediate")
    return { bg: "#fff6d5", color: "text" };
  if (
    normalized === "high" ||
    normalized === "hard" ||
    normalized === "advanced"
  )
    return { bg: "#ffe6e6", color: "text" };
  return { bg: "#e8f7ec", color: "text" };
};

const getSkillIcon = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "entry") return FaUserPlus;
  if (normalized === "medium" || normalized === "intermediate") return FaTools;
  if (
    normalized === "high" ||
    normalized === "hard" ||
    normalized === "advanced"
  )
    return FaAward;
  return FaUserPlus;
};

const VOLUNTEER_CARD_PILL_SX = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.28rem",
  minWidth: "70px",
  textAlign: "center",
  px: "0.55rem",
  py: "0.35rem",
  borderRadius: "999px",
  fontWeight: "heading",
  fontSize: "xs",
  lineHeight: 1,
  border: "1px solid",
  borderColor: "rgba(0,0,0,0.2)",
};
const VOLUNTEER_CARD_POINTS_PILL_ICON_SIZE = 11;
const VOLUNTEER_CARD_SKILL_PILL_ICON_SIZE = 14;
const VOLUNTEER_CARD_MEDIA_SLASH_INSET = "64px";

const VolunteerPage = (props) => {
  const { data, errors } = props;
  const roleNodes = useMemo(
    () =>
      (data || {}).roles ? sortVolunteerRoles(mapEdgesToNodes(data.roles)) : [],
    [data],
  );
  const sanity = useMemo(() => new Client(), []);
  const [roles, setRoles] = useState(roleNodes);
  const [isLoading, setIsLoading] = useState(roleNodes.length === 0);
  const [pageIndex, setPageIndex] = useState(1);
  const [activeOnly, setActiveOnly] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [hasInitializedPagination, setHasInitializedPagination] =
    useState(false);
  const locationSearch = props.location?.search || "";

  const site = (data || {}).site;
  const menuItems = site?.navMenu?.items || [];
  const activeRoles = useMemo(
    () => roles.filter((role) => role?.active !== false),
    [roles],
  );
  const rolesByActivity = useMemo(() => {
    if (!activeOnly) return roles;
    const now = Date.now();
    return activeRoles.filter((role) => {
      const hasAssignedEvent = Boolean(
        role?.motorsportRegEvent &&
        (role?.motorsportRegEvent?.eventId ||
          role?.motorsportRegEvent?.name ||
          role?.motorsportRegEvent?.start ||
          role?.motorsportRegEvent?.url ||
          role?.motorsportRegEvent?.venueName ||
          role?.motorsportRegEvent?.venueCity ||
          role?.motorsportRegEvent?.venueRegion),
      );
      if (!hasAssignedEvent) return true;
      const eventDate = role?.motorsportRegEvent?.start || role?.date;
      if (!eventDate) return false;
      const timestamp = Date.parse(eventDate);
      if (!Number.isFinite(timestamp)) return false;
      return timestamp >= now;
    });
  }, [activeRoles, activeOnly, roles]);
  const roleFilters = useMemo(() => {
    const unique = new Set();
    rolesByActivity.forEach((role) => {
      const roleName = role?.role?.name;
      if (roleName) unique.add(roleName);
    });
    const sorted = Array.from(unique).sort((a, b) => {
      const aLabel = formatRoleFilterLabel(a);
      const bLabel = formatRoleFilterLabel(b);
      return aLabel.localeCompare(bLabel);
    });
    return [
      "All",
      ...sorted.map((value) => ({
        value,
        label: formatRoleFilterLabel(value),
      })),
    ];
  }, [rolesByActivity]);
  const roleLabels = useMemo(() => {
    const map = new Map();
    roleFilters.forEach((item) => {
      if (item && typeof item === "object") {
        map.set(item.value, item.label || item.value);
      }
    });
    return map;
  }, [roleFilters]);
  const venues = useMemo(() => {
    const unique = new Set();
    rolesByActivity.forEach((role) => {
      const venueName = role?.motorsportRegEvent?.venueName;
      if (venueName) unique.add(venueName);
    });
    const sorted = Array.from(unique).sort((a, b) => a.localeCompare(b));
    return ["All", ...sorted];
  }, [rolesByActivity]);
  const pointOptions = useMemo(() => {
    const unique = new Set();
    rolesByActivity.forEach((role) => {
      if (
        role?.role?.pointValue !== undefined &&
        role?.role?.pointValue !== null
      ) {
        unique.add(role.role.pointValue);
      }
    });
    const sorted = Array.from(unique).sort((a, b) => a - b);
    const labeled = sorted.map((value) => ({
      value,
      label: `${value} pt${value === 1 ? "" : "s"}`,
    }));
    return ["All", ...labeled];
  }, [rolesByActivity]);
  const hasVenueFilterOptions = useMemo(
    () => venues.some((venue) => venue !== "All"),
    [venues],
  );
  const hasPointFilterOptions = useMemo(
    () =>
      pointOptions.some((option) => {
        if (typeof option === "object" && option !== null) {
          return option.value !== "All";
        }
        return option !== "All";
      }),
    [pointOptions],
  );
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
  if (activeOnly) {
    filterLabelParts.push("Active");
  }
  if (selectedRoles.length) {
    filterLabelParts.push(
      selectedRoles
        .map((value) => roleLabels.get(value) || formatRoleFilterLabel(value))
        .join(", "),
    );
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
    : activeOnly
      ? "Active"
      : "All";
  const handleSelectAllFilters = () => {
    setSelectedRoles([]);
    setSelectedVenues([]);
    setSelectedPoints([]);
  };
  const filteredRoles = rolesByActivity.filter((role) => {
    if (selectedRoles.length === 0) return true;
    return selectedRoles.includes(role?.role?.name);
  });
  const filteredByVenue = filteredRoles.filter((role) => {
    if (selectedVenues.length === 0) return true;
    return selectedVenues.includes(role?.motorsportRegEvent?.venueName);
  });
  const filteredByPoints = filteredByVenue.filter((role) => {
    if (selectedPoints.length === 0) return true;
    return selectedPoints.includes(role?.role?.pointValue);
  });
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredByPoints.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages);
  const paginatedRoles = filteredByPoints.slice(
    (safePageIndex - 1) * pageSize,
    safePageIndex * pageSize,
  );
  const nowTimestamp = Date.now();
  const upcomingCutoffTimestamp = nowTimestamp + 7 * 24 * 60 * 60 * 1000;
  const todayToken = useMemo(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }, []);
  const paginationItems = buildPaginationItems(safePageIndex, totalPages);
  const pointFilters = hasPointFilterOptions ? (
    <CategoryFilterButtons
      categories={pointOptions}
      selectedCategories={selectedPoints}
      onChange={setSelectedPoints}
      showAll={false}
      layout={hasVenueFilterOptions ? "inline" : "wrap"}
    />
  ) : null;
  const secondaryFilters = hasVenueFilterOptions ? (
    <CategoryFilterButtons
      categories={venues}
      selectedCategories={selectedVenues}
      onChange={setSelectedVenues}
      showAll={false}
      showDivider={hasPointFilterOptions}
      layout="inline"
    >
      {pointFilters}
    </CategoryFilterButtons>
  ) : (
    pointFilters
  );

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
  }, [roles.length, selectedRoles, selectedVenues, selectedPoints, activeOnly]);

  useEffect(() => {
    if (hasInitializedPagination) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(locationSearch);
    const requestedPage = Number(params.get("page"));
    if (Number.isInteger(requestedPage) && requestedPage >= 1) {
      setPageIndex(requestedPage);
    }
    setHasInitializedPagination(true);
  }, [hasInitializedPagination, locationSearch]);

  useEffect(() => {
    if (!hasInitializedPagination) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(locationSearch);
    if (safePageIndex > 1) {
      params.set("page", String(safePageIndex));
    } else {
      params.delete("page");
    }
    const nextSearch = params.toString();
    const nextUrl = nextSearch
      ? `${window.location.pathname}?${nextSearch}`
      : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }, [hasInitializedPagination, locationSearch, safePageIndex]);

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
            flexWrap: ["wrap", "wrap", "wrap", "nowrap"],
            gap: "1rem",
            pb: "0.75rem",
          }}
        >
          <Box
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              maxWidth: ["100%", "100%", "100%", "calc(100% - 316px)"],
            }}
          >
            <Heading
              as="h1"
              sx={{ variant: "styles.h1", mb: "0.35rem", mt: 0 }}
            >
              Volunteer
              <BoxIcon
                as="span"
                sx={{
                  display: "inline-grid",
                  ml: "0.5rem",
                  verticalAlign: "middle",
                }}
              />
            </Heading>
            <Text sx={{ variant: "styles.p", fontSize: "16pt" }}>
              Volunteers are the foundation of the Club’s success. Every event
              we host, experience we deliver, and community we build is made
              possible by members who choose to contribute their time, skills,
              and enthusiasm. Explore open positions below and learn how to get
              involved.
            </Text>
          </Box>
          <Box
            sx={{
              display: "grid",
              gap: "0.5rem",
              width: ["100%", "100%", "100%", "300px"],
              flex: ["1 1 100%", "1 1 100%", "1 1 100%", "0 0 300px"],
              justifyItems: ["stretch", "stretch", "stretch", "end"],
              alignSelf: ["stretch", "stretch", "stretch", "flex-start"],
              backgroundColor: "lightgray",
              borderRadius: "12px",
              p: ["0.75rem", "0.85rem", "0.95rem"],
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
                  borderColor: "secondary",
                  backgroundColor: "secondary",
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  fontSize: "xs",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  "&:hover": {
                    backgroundColor: "primary",
                    borderColor: "primary",
                    color: "white",
                  },
                }}
              >
                <Box
                  as="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <FaClipboardList size={30} />
                  <Text as="span" sx={{ fontSize: "xs", color: "inherit" }}>
                    Volunteering Overview
                  </Text>
                </Box>
                <Box
                  as="span"
                  sx={{
                    width: "20px",
                    height: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 20px",
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
                  borderColor: "secondary",
                  backgroundColor: "secondary",
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  fontSize: "xs",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  "&:hover": {
                    backgroundColor: "primary",
                    borderColor: "primary",
                    color: "white",
                  },
                }}
              >
                <Box
                  as="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <FaAward size={30} />
                  <Text as="span" sx={{ fontSize: "xs", color: "inherit" }}>
                    Rewards Program
                  </Text>
                </Box>
                <Box
                  as="span"
                  sx={{
                    width: "20px",
                    height: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 20px",
                  }}
                >
                  <FiArrowRight size={20} />
                </Box>
              </Card>
            </Link>
            <Link
              to="/volunteer/roles"
              sx={{ textDecoration: "none", width: "100%", display: "block" }}
            >
              <Card
                sx={{
                  width: "100%",
                  px: "1rem",
                  py: "0.65rem",
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "secondary",
                  backgroundColor: "secondary",
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  fontSize: "xs",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  "&:hover": {
                    backgroundColor: "primary",
                    borderColor: "primary",
                    color: "white",
                  },
                }}
              >
                <Box
                  as="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <FaUsers size={30} />
                  <Text as="span" sx={{ fontSize: "xs", color: "inherit" }}>
                    Volunteer Roles
                  </Text>
                </Box>
                <Box
                  as="span"
                  sx={{
                    width: "20px",
                    height: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 20px",
                  }}
                >
                  <FiArrowRight size={20} />
                </Box>
              </Card>
            </Link>
          </Box>
        </Flex>
        <Heading sx={{ variant: "styles.h3", mt: "0.5rem" }}>Filter</Heading>
        <Box
          sx={{
            mt: "1rem",
            mb: "1.5rem",
            p: ["1rem", "1.25rem"],
            backgroundColor: "lightgray",
            border: "1px solid",
            borderColor: "black",
            borderRadius: "12px",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: "1 1 100%" }}>
            <CategoryFilterButtons
              categories={roleFilters}
              selectedCategories={selectedRoles}
              onChange={setSelectedRoles}
              allLabel="Active"
              allSelected={activeOnly}
              onAllToggle={() => setActiveOnly((prev) => !prev)}
              onSelectAll={handleSelectAllFilters}
              showDivider={Boolean(secondaryFilters)}
            >
              {secondaryFilters}
            </CategoryFilterButtons>
          </Box>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            columnGap: "0.75rem",
            rowGap: "0.25rem",
            alignItems: "end",
            borderBottomStyle: "solid",
            pb: "3px",
            borderBottomWidth: "3px",
            my: "0.5rem",
          }}
        >
          <Heading
            sx={{
              variant: "styles.h3",
              mb: 0,
              minWidth: 0,
              overflowWrap: "anywhere",
              lineHeight: 1.2,
            }}
          >
            Positions — {combinedFilterLabel}
          </Heading>
          <a
            href="https://motorsportreg.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: 15,
              justifySelf: "end",
              alignSelf: "end",
            }}
          >
            <img
              src="https://msr-hotlink.s3.amazonaws.com/powered-by/powered-by-msr-outline@2x.png"
              alt="Online registration and event management service for motorsport events powered by MotorsportReg.com"
              title="Online registration and event management service for motorsport events powered by MotorsportReg.com"
              style={{ width: 185, height: 33, display: "block" }}
            />
          </a>
        </Box>
        {paginatedRoles.length > 0 && (
          <Box sx={{ display: "grid", gap: "1.25rem" }}>
            {paginatedRoles.map((role) => {
              const imageUrl = normalizeImageUrl(
                role?.motorsportRegEvent?.imageUrl,
              );
              const hasAssignedEvent = Boolean(
                role?.motorsportRegEvent &&
                (role?.motorsportRegEvent?.eventId ||
                  role?.motorsportRegEvent?.name ||
                  role?.motorsportRegEvent?.start ||
                  role?.motorsportRegEvent?.url ||
                  role?.motorsportRegEvent?.venueName ||
                  role?.motorsportRegEvent?.venueCity ||
                  role?.motorsportRegEvent?.venueRegion),
              );
              const roleDate = role?.date || role?.motorsportRegEvent?.start;
              const roleStartTimestamp = roleDate ? Date.parse(roleDate) : NaN;
              const registrationStartDate = parseCalendarDate(
                role?.motorsportRegEvent?.registrationStart,
              );
              const registrationEndDate = parseCalendarDate(
                role?.motorsportRegEvent?.registrationEnd,
              );
              const hasRegistrationWindow = Boolean(
                registrationStartDate || registrationEndDate,
              );
              const isRegistrationOpen = hasRegistrationWindow
                ? (!registrationStartDate ||
                    nowTimestamp >= registrationStartDate.getTime()) &&
                  (!registrationEndDate ||
                    nowTimestamp <= registrationEndDate.getTime())
                : null;
              const roleEventDateToken =
                toDateToken(role?.motorsportRegEvent?.start) ||
                toDateToken(role?.date);
              const roleStatusIsOpen = hasRegistrationWindow
                ? isRegistrationOpen === true
                : Boolean(
                    hasAssignedEvent &&
                    roleEventDateToken &&
                    todayToken &&
                    roleEventDateToken > todayToken,
                  );
              const isUpcoming =
                Number.isFinite(roleStartTimestamp) &&
                roleStartTimestamp >= nowTimestamp &&
                roleStartTimestamp <= upcomingCutoffTimestamp;
              const formattedDate = roleDate
                ? format(parseISO(roleDate), "MMM d, yyyy")
                : null;
              const hasDuration =
                role?.duration !== undefined &&
                role?.duration !== null &&
                role?.duration !== "";
              const durationValue = hasDuration ? Number(role.duration) : null;
              const durationLabel = hasDuration
                ? `${role.duration} hour${
                    Number.isFinite(durationValue) && durationValue === 1
                      ? ""
                      : "s"
                  }`
                : null;
              const membershipLabel =
                role?.membershipRequired === true
                  ? "Membership required"
                  : role?.membershipRequired === false
                    ? "No membership required"
                    : null;
              const secondaryMetaParts = [
                formattedDate,
                durationLabel,
                membershipLabel,
              ].filter(Boolean);
              const venueParts = [
                role?.motorsportRegEvent?.venueName,
                role?.motorsportRegEvent?.venueCity,
                role?.motorsportRegEvent?.venueRegion,
              ].filter(Boolean);
              const venueLabel = venueParts.join(", ");
              const showVenueOnCard = !hasAssignedEvent && Boolean(venueLabel);
              const roleUrl = role?.slug?.current
                ? getVolunteerRoleUrl(role.slug.current)
                : null;
              const FallbackRoleIcon = getRoleCardIcon(getPositionTitle(role));
              const fallbackCapColor = getVolunteerPointCapColor(
                role?.role?.pointValue,
              );
              const roleDescription = role?.role?.description?.trim() || "";
              const skillLevelLabel = formatSkillLevel(role?.skillLevel);
              const skillTone = getSkillTone(role?.skillLevel);
              const SkillIcon = getSkillIcon(role?.skillLevel);
              const cardProps = roleUrl ? { as: Link, to: roleUrl } : {};
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
                      alignItems: ["stretch", "stretch", "stretch", "stretch"],
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
                        clipPath: [
                          "none",
                          "none",
                          `polygon(0 0, 100% 0, calc(100% - ${VOLUNTEER_CARD_MEDIA_SLASH_INSET}) 100%, 0 100%)`,
                        ],
                        backgroundColor: hasAssignedEvent
                          ? "lightgray"
                          : fallbackCapColor,
                      }}
                    >
                      {imageUrl && hasAssignedEvent && (
                        <Box
                          as="img"
                          src={imageUrl}
                          alt={
                            role?.motorsportRegEvent?.name ||
                            getPositionTitle(role)
                          }
                          {...nonDraggableImageProps}
                          sx={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            ...nonDraggableImageSx,
                          }}
                        />
                      )}
                      {!hasAssignedEvent && (
                        <Flex
                          sx={{
                            position: "absolute",
                            inset: 0,
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          <FallbackRoleIcon size={88} aria-hidden="true" />
                        </Flex>
                      )}
                    </Box>
                    <Box
                      sx={{
                        px: "1.5rem",
                        py: "1.5rem",
                        flex: ["1 1 100%", "1 1 100%", "1 1 60%"],
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        {role?.role?.pointValue !== undefined &&
                          role?.role?.pointValue !== null && (
                            <Text
                              sx={{
                                ...VOLUNTEER_CARD_PILL_SX,
                                bg: "lightgray",
                                color: "text",
                              }}
                            >
                              <FaStar
                                size={VOLUNTEER_CARD_POINTS_PILL_ICON_SIZE}
                                aria-hidden="true"
                              />
                              {role.role.pointValue} pts
                            </Text>
                          )}
                        {skillLevelLabel && (
                          <Text
                            sx={{
                              ...VOLUNTEER_CARD_PILL_SX,
                              bg: skillTone.bg,
                              color: skillTone.color,
                            }}
                          >
                            <SkillIcon
                              size={VOLUNTEER_CARD_SKILL_PILL_ICON_SIZE}
                              aria-hidden="true"
                            />
                            {skillLevelLabel}
                          </Text>
                        )}
                        {isUpcoming && (
                          <Text
                            sx={{
                              ...VOLUNTEER_CARD_PILL_SX,
                              bg: "#e8f7ec",
                              color: "#1f7a3f",
                              borderColor: "rgba(31,122,63,0.35)",
                            }}
                          >
                            <FaCalendarAlt size={12} aria-hidden="true" />
                            Upcoming
                          </Text>
                        )}
                        {hasAssignedEvent && (
                          <Text
                            sx={{
                              ...VOLUNTEER_CARD_PILL_SX,
                              bg: roleStatusIsOpen ? "#e8f7ec" : "#fde8e8",
                              color: roleStatusIsOpen ? "#1f7a3f" : "#9a1f1f",
                              borderColor: roleStatusIsOpen
                                ? "rgba(31,122,63,0.35)"
                                : "rgba(154,31,31,0.35)",
                            }}
                          >
                            <Box
                              as="span"
                              sx={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "999px",
                                bg: roleStatusIsOpen ? "#1f7a3f" : "#9a1f1f",
                              }}
                            />
                            {roleStatusIsOpen ? "Open" : "Closed"}
                          </Text>
                        )}
                      </Box>
                      <Heading as="h3" sx={{ variant: "styles.h3", mb: 0 }}>
                        {getPositionTitle(role)}
                      </Heading>
                      {hasAssignedEvent && role?.motorsportRegEvent?.name && (
                        <Text sx={{ fontSize: "sm", color: "darkgray" }}>
                          {role.motorsportRegEvent.name}
                        </Text>
                      )}
                      {!hasAssignedEvent && roleDescription && (
                        <Text sx={{ fontSize: "sm", color: "darkgray" }}>
                          {roleDescription}
                        </Text>
                      )}
                      {(showVenueOnCard || secondaryMetaParts.length > 0) && (
                        <Flex
                          sx={{
                            flexDirection: ["column", "column", "row"],
                            alignItems: ["flex-start", "flex-start", "center"],
                            gap: ["0.15rem", "0.15rem", "0.5rem"],
                            color: "gray",
                            fontSize: "xs",
                          }}
                        >
                          {showVenueOnCard && (
                            <Text sx={{ fontSize: "inherit" }}>
                              {venueLabel}
                            </Text>
                          )}
                          {showVenueOnCard && secondaryMetaParts.length > 0 && (
                            <Text
                              sx={{
                                fontSize: "inherit",
                                display: ["none", "none", "inline"],
                              }}
                            >
                              |
                            </Text>
                          )}
                          {secondaryMetaParts.length > 0 && (
                            <Text sx={{ fontSize: "inherit" }}>
                              {secondaryMetaParts.join(" · ")}
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
        {!isLoading && rolesByActivity.length === 0 && (
          <Box sx={{ mt: "1.5rem", color: "darkgray" }}>
            {activeOnly
              ? "No volunteer positions are active right now."
              : "No volunteer positions are available yet."}
          </Box>
        )}
        {!isLoading &&
          rolesByActivity.length > 0 &&
          paginatedRoles.length === 0 && (
            <Box sx={{ mt: "1.5rem", color: "darkgray" }}>
              No volunteer positions match those filters yet.
            </Box>
          )}
        {isLoading && (
          <Box sx={{ mt: "1.5rem", color: "darkgray" }}>
            Loading volunteer positions...
          </Box>
        )}
        {totalPages > 1 && (
          <Box
            sx={{
              mt: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.4rem",
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
                  color: safePageIndex === 1 ? "darkgray" : "text",
                },
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
                      alignSelf: "center",
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
                      color: isActive ? "white" : "text",
                    },
                  }}
                >
                  {item.value}
                </Button>
              );
            })}
            <Button
              onClick={() =>
                setPageIndex(Math.min(totalPages, safePageIndex + 1))
              }
              disabled={safePageIndex === totalPages}
              sx={{
                variant: "buttons.primary",
                bg: safePageIndex === totalPages ? "lightgray" : "background",
                color: safePageIndex === totalPages ? "darkgray" : "text",
                border: "1px solid",
                borderColor: "gray",
                px: "0.9rem",
                py: "0.4rem",
                cursor:
                  safePageIndex === totalPages ? "not-allowed" : "pointer",
                "&:hover": {
                  bg: safePageIndex === totalPages ? "lightgray" : "highlight",
                  color: safePageIndex === totalPages ? "darkgray" : "text",
                },
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
