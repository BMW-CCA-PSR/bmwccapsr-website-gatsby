/** @jsxImportSource theme-ui */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, graphql } from "gatsby";
import { Box, Button, Card, Flex, Heading, Text } from "@theme-ui/components";
import { format, parseISO } from "date-fns";
import GraphQLErrorList from "../components/graphql-error-list";
import Seo from "../components/seo";
import Layout from "../containers/layout";
import ContentContainer from "../components/content-container";
import { BoxIcon } from "../components/box-icons";
import StylizedLandingHeader from "../components/stylized-landing-header";
import { Client } from "../services/FetchClient";
import {
  FilterField,
  FilterGrid,
  FilterPillButton,
  FilterPillRow,
  FilterSearchField,
  FilterSelect,
} from "../components/filter-ui";
import { getVolunteerRoleUrl, mapEdgesToNodes } from "../lib/helpers";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";
import {
  FiArrowRight,
  FiChevronDown,
  FiGrid,
  FiList,
  FiSliders,
} from "react-icons/fi";
import {
  FaAward,
  FaCalendarAlt,
  FaClipboardList,
  FaStar,
  FaTools,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { getVolunteerRoleIconComponent } from "../lib/volunteerRolePresentation";

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
            roleScope
            icon
            color
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

const sortOptions = [
  { value: "dateAsc", label: "Date: Soonest" },
  { value: "dateDesc", label: "Date: Latest" },
  { value: "titleAsc", label: "Title: A-Z" },
  { value: "titleDesc", label: "Title: Z-A" },
  { value: "pointsDesc", label: "Points: Highest" },
  { value: "pointsAsc", label: "Points: Lowest" },
];

const VOLUNTEER_VIEW_STORAGE_KEY = "bmwcca-volunteer-view-mode";

const scopeOptions = [
  { value: "all", label: "All scopes" },
  { value: "event", label: "Event" },
  { value: "program", label: "Club" },
];

const skillLevelOptions = [
  { value: "all", label: "All skill levels" },
  { value: "entry", label: "Entry" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

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

const getSkillLevelKey = (value) => {
  if (!value) return null;
  const normalized = String(value).toLowerCase();
  if (normalized === "entry") return "entry";
  if (normalized === "medium" || normalized === "intermediate")
    return "intermediate";
  if (
    normalized === "high" ||
    normalized === "hard" ||
    normalized === "advanced"
  )
    return "advanced";
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
const VOLUNTEER_APPLICATION_SESSION_KEY_PREFIX = "volunteerApplicationSession:";
const VOLUNTEER_STATUS_CAP_BASE_SX = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  bg: "#1f7a3f",
  color: "white",
  fontSize: "24px",
  fontWeight: "heading",
  lineHeight: 1.1,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
  pointerEvents: "none",
};
const VOLUNTEER_LANDING_STATUS_CAP_META = {
  submitted: { label: "Submitted", bg: "#2f9e44", color: "white" },
  assigned: { label: "Assigned", bg: "#1f7a3f", color: "white" },
  withdrawn: { label: "Withdrawn", bg: "#f4c430", color: "#1f1f1f" },
  denied: { label: "Rejected", bg: "#9a1f1f", color: "white" },
  rejected: { label: "Rejected", bg: "#9a1f1f", color: "white" },
};
const VOLUNTEER_FILLED_STATUS_CAP_META = {
  label: "Filled",
  bg: "#6b7280",
  color: "white",
};
const VOLUNTEER_ROLES_REFRESH_INTERVAL_MS = 60 * 1000;
const normalizeApplicationStatus = (value) => {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  if (!key) return null;
  if (key === "denied") return "rejected";
  if (key in VOLUNTEER_LANDING_STATUS_CAP_META) return key;
  return null;
};

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
  const [statusFilter, setStatusFilter] = useState("active");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [selectedScope, setSelectedScope] = useState("all");
  const [selectedSort, setSelectedSort] = useState("dateAsc");
  const [viewMode, setViewMode] = useState("horizontal");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [applicationStatusByPosition, setApplicationStatusByPosition] =
    useState({});
  const [hasInitializedPagination, setHasInitializedPagination] =
    useState(false);
  const locationSearch = props.location?.search || "";
  const isMountedRef = useRef(true);

  const site = (data || {}).site;
  const menuItems = site?.navMenu?.items || [];
  const activeRoles = useMemo(
    () => roles.filter((role) => role?.active !== false),
    [roles],
  );
  const rolesByStatus = useMemo(() => {
    if (statusFilter === "all") return roles;
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
  }, [activeRoles, roles, statusFilter]);
  const roleFilterOptions = useMemo(() => {
    const unique = new Set();
    rolesByStatus.forEach((role) => {
      const roleName = role?.role?.name;
      if (roleName) unique.add(roleName);
    });
    const sorted = Array.from(unique).sort((a, b) => {
      const aLabel = formatRoleFilterLabel(a);
      const bLabel = formatRoleFilterLabel(b);
      return aLabel.localeCompare(bLabel);
    });
    return [
      { value: "all", label: "All roles" },
      ...sorted.map((value) => ({
        value,
        label: formatRoleFilterLabel(value),
      })),
    ];
  }, [rolesByStatus]);
  const roleLabels = useMemo(() => {
    const map = new Map();
    roleFilterOptions.forEach((item) => {
      if (item && typeof item === "object") {
        map.set(item.value, item.label || item.value);
      }
    });
    return map;
  }, [roleFilterOptions]);
  const filterLabelParts = [];
  filterLabelParts.push(statusFilter === "active" ? "Active" : "All");
  if (searchTerm.trim()) {
    filterLabelParts.push(`"${searchTerm.trim()}"`);
  }
  if (selectedRole !== "all") {
    filterLabelParts.push(
      roleLabels.get(selectedRole) || formatRoleFilterLabel(selectedRole),
    );
  }
  if (selectedSkill !== "all") {
    filterLabelParts.push(
      skillLevelOptions.find((option) => option.value === selectedSkill)
        ?.label || selectedSkill,
    );
  }
  if (selectedScope !== "all") {
    filterLabelParts.push(
      scopeOptions.find((option) => option.value === selectedScope)?.label ||
        selectedScope,
    );
  }
  if (selectedSort !== "dateAsc") {
    filterLabelParts.push(
      sortOptions.find((option) => option.value === selectedSort)?.label ||
        selectedSort,
    );
  }
  const hasAnyFilterSelections =
    statusFilter !== "active" ||
    selectedRole !== "all" ||
    selectedSkill !== "all" ||
    selectedScope !== "all" ||
    selectedSort !== "dateAsc" ||
    searchTerm.trim().length > 0;
  const combinedFilterLabel = filterLabelParts.join(" · ");
  useEffect(() => {
    if (hasAnyFilterSelections) {
      setMobileFiltersOpen(true);
    }
  }, [hasAnyFilterSelections]);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchedRoles = rolesByStatus.filter((role) => {
    if (!normalizedSearch) return true;
    const haystack = [
      role?.role?.name,
      role?.role?.description,
      role?.motorsportRegEvent?.name,
      role?.motorsportRegEvent?.venueName,
      role?.motorsportRegEvent?.venueCity,
      role?.motorsportRegEvent?.venueRegion,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedSearch);
  });
  const filteredRoles = searchedRoles.filter((role) => {
    if (selectedRole === "all") return true;
    return selectedRole === role?.role?.name;
  });
  const filteredBySkill = filteredRoles.filter((role) => {
    if (selectedSkill === "all") return true;
    return getSkillLevelKey(role?.skillLevel) === selectedSkill;
  });
  const filteredByScope = filteredBySkill.filter((role) => {
    if (selectedScope === "all") return true;
    const normalizedRoleScope = String(role?.role?.roleScope || "")
      .trim()
      .toLowerCase();
    if (normalizedRoleScope === "event" || normalizedRoleScope === "program") {
      return normalizedRoleScope === selectedScope;
    }
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
    return (hasAssignedEvent ? "event" : "program") === selectedScope;
  });
  const sortedRoles = useMemo(() => {
    const list = [...filteredByScope];
    const getRoleDateValue = (role) => {
      const value = role?.date || role?.motorsportRegEvent?.start;
      if (!value) return null;
      const timestamp = Date.parse(value);
      return Number.isFinite(timestamp) ? timestamp : null;
    };
    const getRolePointsValue = (role) => {
      const value = Number(role?.role?.pointValue);
      return Number.isFinite(value) ? value : null;
    };
    const getRoleTitleValue = (role) =>
      String(getPositionTitle(role) || "").toLowerCase();
    list.sort((a, b) => {
      if (selectedSort === "dateDesc") {
        const aDate = getRoleDateValue(a);
        const bDate = getRoleDateValue(b);
        if (aDate === null && bDate === null) return 0;
        if (aDate === null) return 1;
        if (bDate === null) return -1;
        if (aDate !== bDate) return bDate - aDate;
        return getRoleTitleValue(a).localeCompare(getRoleTitleValue(b));
      }
      if (selectedSort === "titleAsc") {
        return getRoleTitleValue(a).localeCompare(getRoleTitleValue(b));
      }
      if (selectedSort === "titleDesc") {
        return getRoleTitleValue(b).localeCompare(getRoleTitleValue(a));
      }
      if (selectedSort === "pointsDesc") {
        const aPoints = getRolePointsValue(a);
        const bPoints = getRolePointsValue(b);
        if (aPoints === null && bPoints === null) return 0;
        if (aPoints === null) return 1;
        if (bPoints === null) return -1;
        if (aPoints !== bPoints) return bPoints - aPoints;
        return getRoleTitleValue(a).localeCompare(getRoleTitleValue(b));
      }
      if (selectedSort === "pointsAsc") {
        const aPoints = getRolePointsValue(a);
        const bPoints = getRolePointsValue(b);
        if (aPoints === null && bPoints === null) return 0;
        if (aPoints === null) return 1;
        if (bPoints === null) return -1;
        if (aPoints !== bPoints) return aPoints - bPoints;
        return getRoleTitleValue(a).localeCompare(getRoleTitleValue(b));
      }
      const aDate = getRoleDateValue(a);
      const bDate = getRoleDateValue(b);
      if (aDate === null && bDate === null) return 0;
      if (aDate === null) return 1;
      if (bDate === null) return -1;
      if (aDate !== bDate) return aDate - bDate;
      return getRoleTitleValue(a).localeCompare(getRoleTitleValue(b));
    });
    return list;
  }, [filteredByScope, selectedSort]);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(sortedRoles.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages);
  const paginatedRoles = sortedRoles.slice(
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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshRoles = useCallback(
    async ({ allowLoadingState = false } = {}) => {
      if (allowLoadingState) {
        setIsLoading((current) => current || roleNodes.length === 0);
      }
      try {
        const data = await sanity.fetchVolunteerRoles();
        if (!isMountedRef.current) return;
        setRoles(sortVolunteerRoles(Array.isArray(data) ? data : []));
      } catch (_error) {
        // Keep existing role data if the refresh fails.
      } finally {
        if (allowLoadingState && isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [roleNodes.length, sanity],
  );

  useEffect(() => {
    setIsLoading(roleNodes.length === 0);
    refreshRoles({ allowLoadingState: true });
  }, [refreshRoles, roleNodes.length]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshRoles();
      }
    };
    const handleFocus = () => {
      refreshRoles();
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshRoles();
      }
    }, VOLUNTEER_ROLES_REFRESH_INTERVAL_MS);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshRoles]);

  useEffect(() => {
    if (roleNodes.length && roles.length === 0) {
      setRoles(sortVolunteerRoles(roleNodes));
      setIsLoading(false);
    }
  }, [roleNodes, roles.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedViewMode = window.localStorage.getItem(
        VOLUNTEER_VIEW_STORAGE_KEY,
      );
      if (storedViewMode === "grid" || storedViewMode === "horizontal") {
        setViewMode(storedViewMode);
      }
    } catch (_error) {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(VOLUNTEER_VIEW_STORAGE_KEY, viewMode);
    } catch (_error) {
      // ignore storage errors
    }
  }, [viewMode]);

  useEffect(() => {
    setPageIndex(1);
  }, [
    roles.length,
    selectedRole,
    selectedSkill,
    selectedScope,
    selectedSort,
    statusFilter,
    searchTerm,
  ]);
  const sortControlSx = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    bg: "lightgray",
    color: "text",
    border: "1px solid",
    borderColor: "gray",
    borderRadius: "8px",
    px: "0.65rem",
    py: "0.25rem",
    fontSize: "xs",
    fontWeight: "heading",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition: "background-color 160ms ease, border-color 160ms ease",
    "&:hover": {
      bg: "#e7f0ff",
      borderColor: "#90b4f8",
    },
  };
  const viewToggleButtonSx = {
    ...sortControlSx,
    minWidth: "42px",
    px: "0.65rem",
    color: viewMode === "horizontal" ? "primary" : "text",
  };

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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const readApplicationStatuses = () => {
      const nextStatuses = {};
      Object.keys(window.localStorage).forEach((key) => {
        if (!key.startsWith(VOLUNTEER_APPLICATION_SESSION_KEY_PREFIX)) return;
        const positionId = key.slice(
          VOLUNTEER_APPLICATION_SESSION_KEY_PREFIX.length,
        );
        if (!positionId) return;
        try {
          const raw = window.localStorage.getItem(key);
          if (!raw) return;
          const parsed = JSON.parse(raw);
          const status = normalizeApplicationStatus(parsed?.status);
          const hasApplicationId = Boolean(parsed?.applicationId);
          if (!hasApplicationId || !status) return;
          nextStatuses[positionId] = status;
        } catch (_) {
          // Ignore malformed local storage values.
        }
      });
      setApplicationStatusByPosition(nextStatuses);
    };

    readApplicationStatuses();
    window.addEventListener("storage", readApplicationStatuses);
    return () => window.removeEventListener("storage", readApplicationStatuses);
  }, []);

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
              border: "1px solid",
              borderColor: "black",
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
        <Box
          sx={{
            mt: "0.75rem",
            mb: "1.5rem",
            border: ["1px solid", "1px solid", "none"],
            borderColor: ["black", "black", "transparent"],
            borderRadius: ["12px", "12px", 0],
            bg: ["lightgray", "lightgray", "transparent"],
            overflow: "hidden",
          }}
        >
          <Button
            type="button"
            aria-expanded={mobileFiltersOpen}
            aria-controls="volunteer-landing-filter-panel"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            sx={{
              display: ["inline-flex", "inline-flex", "none"],
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              px: "1rem",
              py: "0.7rem",
              borderRadius: [
                0,
                0,
                mobileFiltersOpen ? "12px 12px 0 0" : "12px",
              ],
              border: ["none", "none", "1px solid"],
              borderColor: ["transparent", "transparent", "black"],
              bg: "lightgray",
              color: "text",
              fontSize: "sm",
              fontWeight: "heading",
              lineHeight: 1.1,
              cursor: "pointer",
              boxShadow: "none",
              "&:hover": {
                bg: "muted",
              },
            }}
          >
            <Text as="span" sx={{ fontSize: "inherit", color: "inherit" }}>
              Filter
            </Text>
            <Box
              as="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 180ms ease",
                transform: mobileFiltersOpen
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
            >
              <FiChevronDown size={18} />
            </Box>
          </Button>

          <Box
            id="volunteer-landing-filter-panel"
            sx={{
              overflow: "hidden",
              maxHeight: [
                mobileFiltersOpen ? "1200px" : 0,
                mobileFiltersOpen ? "1200px" : 0,
                "none",
              ],
              opacity: [
                mobileFiltersOpen ? 1 : 0,
                mobileFiltersOpen ? 1 : 0,
                1,
              ],
              pointerEvents: [
                mobileFiltersOpen ? "auto" : "none",
                mobileFiltersOpen ? "auto" : "none",
                "auto",
              ],
              transition:
                "max-height 220ms ease, opacity 180ms ease, padding 180ms ease",
            }}
          >
            <Box
              sx={{
                mt: [0, 0, "0.75rem"],
                mb: 0,
                border: ["none", "none", "1px solid"],
                borderColor: ["transparent", "transparent", "black"],
                borderRadius: [0, 0, "12px"],
                borderTopColor: ["transparent", "transparent", "black"],
                bg: ["lightgray", "lightgray", "lightgray"],
                boxShadow: "none",
                p: ["1rem", "1.25rem"],
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <FilterGrid sx={{ gridTemplateColumns: ["1fr"] }}>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <FilterSearchField
                    label="Search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search role, event, skill"
                    clearLabel="Clear filters"
                    clearDisabled={!hasAnyFilterSelections}
                    onClear={() => {
                      setStatusFilter("active");
                      setSelectedRole("all");
                      setSelectedSkill("all");
                      setSelectedScope("all");
                      setSelectedSort("dateAsc");
                      setSearchTerm("");
                    }}
                    fieldSx={{ minWidth: ["100%", "320px"] }}
                  />
                </Box>
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    display: "grid",
                    gridTemplateColumns: [
                      "1fr",
                      "1fr 1fr",
                      "repeat(4, minmax(0, 1fr))",
                    ],
                    gap: "0.75rem",
                    alignItems: "end",
                  }}
                >
                  <FilterField label="Status">
                    <FilterPillRow sx={{ flexWrap: "nowrap", width: "100%" }}>
                      <FilterPillButton
                        type="button"
                        onClick={() => setStatusFilter("active")}
                        active={statusFilter === "active"}
                        sx={{ flex: "1 1 0" }}
                      >
                        Active
                      </FilterPillButton>
                      <FilterPillButton
                        type="button"
                        onClick={() => setStatusFilter("all")}
                        active={statusFilter === "all"}
                        sx={{ flex: "1 1 0" }}
                      >
                        All
                      </FilterPillButton>
                    </FilterPillRow>
                  </FilterField>
                  <FilterField label="Role">
                    <FilterSelect
                      value={selectedRole}
                      onChange={(event) => setSelectedRole(event.target.value)}
                    >
                      {roleFilterOptions.map((option) => (
                        <option
                          key={`role-filter-${option.value}`}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </FilterSelect>
                  </FilterField>
                  <FilterField label="Skill level">
                    <FilterSelect
                      value={selectedSkill}
                      onChange={(event) => setSelectedSkill(event.target.value)}
                    >
                      {skillLevelOptions.map((option) => (
                        <option
                          key={`skill-filter-${option.value}`}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </FilterSelect>
                  </FilterField>
                  <FilterField label="Scope">
                    <FilterSelect
                      value={selectedScope}
                      onChange={(event) => setSelectedScope(event.target.value)}
                    >
                      {scopeOptions.map((option) => (
                        <option
                          key={`scope-filter-${option.value}`}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </FilterSelect>
                  </FilterField>
                </Box>
              </FilterGrid>
            </Box>
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
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              justifySelf: "end",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://motorsportreg.com"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: 0,
              }}
            >
              <Box
                as="img"
                src="https://msr-hotlink.s3.amazonaws.com/powered-by/powered-by-msr-outline@2x.png"
                alt="Online registration and event management service for motorsport events powered by MotorsportReg.com"
                title="Online registration and event management service for motorsport events powered by MotorsportReg.com"
                sx={{
                  width: ["156px", "168px", "185px", "185px"],
                  height: ["28px", "30px", "33px", "33px"],
                  display: "block",
                }}
              />
            </a>
            <Box
              sx={{
                ...sortControlSx,
                display: ["none", "none", "inline-flex", "inline-flex"],
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <FiSliders size={20} />
              <FilterSelect
                aria-label="Sort positions"
                value={selectedSort}
                onChange={(event) => setSelectedSort(event.target.value)}
                sx={{
                  minWidth: "170px",
                  bg: "transparent",
                  border: "none",
                  color: "text",
                  fontSize: "xs",
                  fontWeight: "heading",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  py: 0,
                  px: 0,
                  cursor: "pointer",
                  "&:focus": {
                    outline: "none",
                    boxShadow: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                    boxShadow: "none",
                  },
                }}
              >
                {sortOptions.map((option) => (
                  <option
                    key={`role-sort-${option.value}`}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </FilterSelect>
            </Box>
            <Button
              type="button"
              aria-label={
                viewMode === "horizontal"
                  ? "Switch to grid position cards"
                  : "Switch to horizontal position cards"
              }
              title={
                viewMode === "horizontal"
                  ? "Switch to grid position cards"
                  : "Switch to horizontal position cards"
              }
              onClick={() =>
                setViewMode((current) =>
                  current === "horizontal" ? "grid" : "horizontal",
                )
              }
              sx={{
                ...viewToggleButtonSx,
                display: ["none", "none", "inline-flex", "inline-flex"],
              }}
            >
              {viewMode === "horizontal" ? (
                <FiGrid size={18} aria-hidden="true" />
              ) : (
                <FiList size={18} aria-hidden="true" />
              )}
            </Button>
          </Box>
        </Box>
        {paginatedRoles.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gap: "1.25rem",
              gridTemplateColumns:
                viewMode === "grid"
                  ? [
                      "1fr",
                      "1fr",
                      "repeat(2, minmax(0, 1fr))",
                      "repeat(2, minmax(0, 1fr))",
                    ]
                  : "1fr",
            }}
          >
            {paginatedRoles.map((role) => {
              const rolePositionId = String(role?.id || role?._id || "");
              const landingStatusKey = rolePositionId
                ? applicationStatusByPosition[rolePositionId] || null
                : null;
              const landingStatusMeta = landingStatusKey
                ? VOLUNTEER_LANDING_STATUS_CAP_META[landingStatusKey] || null
                : null;
              const imageUrl = normalizeImageUrl(
                role?.motorsportRegEvent?.imageUrl,
              );
              const normalizedRoleScope = String(role?.role?.roleScope || "")
                .trim()
                .toLowerCase();
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
              const showDateBadge = Boolean(
                roleDate &&
                (normalizedRoleScope === "event" || hasAssignedEvent),
              );
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
                showDateBadge ? null : formattedDate,
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
              const RolePresentationIcon = getVolunteerRoleIconComponent(
                role?.role?.icon,
              );
              const roleDescription = role?.role?.description?.trim() || "";
              const skillLevelLabel = formatSkillLevel(role?.skillLevel);
              const skillTone = getSkillTone(role?.skillLevel);
              const SkillIcon = getSkillIcon(role?.skillLevel);
              const assignedVolunteerCount = Number(
                role?.assignedVolunteerCount,
              );
              const isNonEventFilled =
                !hasAssignedEvent &&
                (role?.active === false ||
                  (Number.isFinite(assignedVolunteerCount) &&
                    assignedVolunteerCount > 0));
              const filledStatusMeta =
                !landingStatusMeta && isNonEventFilled
                  ? VOLUNTEER_FILLED_STATUS_CAP_META
                  : null;
              const statusCapMeta = landingStatusMeta || filledStatusMeta;
              const cardProps = roleUrl ? { as: Link, to: roleUrl } : {};
              const isGridDesktop = viewMode === "grid";
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
                      flexDirection: isGridDesktop
                        ? ["column", "column", "column", "column"]
                        : ["column", "column", "row", "row"],
                      alignItems: ["stretch", "stretch", "stretch", "stretch"],
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        minHeight: isGridDesktop
                          ? ["200px", "220px", "220px", "220px"]
                          : ["200px", "220px", "auto"],
                        height: isGridDesktop
                          ? ["200px", "220px", "220px", "220px"]
                          : ["200px", "220px", "auto"],
                        alignSelf: "stretch",
                        flex: isGridDesktop
                          ? "0 0 auto"
                          : ["0 0 auto", "0 0 auto", "1 1 42%"],
                        borderRadius: isGridDesktop
                          ? ["0", "0", "18px 18px 0 0", "18px 18px 0 0"]
                          : ["0", "0", "18px 0 0 18px"],
                        overflow: "hidden",
                        clipPath: isGridDesktop
                          ? "none"
                          : [
                              "none",
                              "none",
                              `polygon(0 0, 100% 0, calc(100% - ${VOLUNTEER_CARD_MEDIA_SLASH_INSET}) 100%, 0 100%)`,
                            ],
                        backgroundColor: hasAssignedEvent
                          ? "lightgray"
                          : "black",
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
                      {!hasAssignedEvent && RolePresentationIcon && (
                        <Flex
                          sx={{
                            position: "absolute",
                            inset: 0,
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          <RolePresentationIcon size={88} aria-hidden="true" />
                        </Flex>
                      )}
                      {statusCapMeta && (
                        <Box
                          as="span"
                          sx={{
                            ...VOLUNTEER_STATUS_CAP_BASE_SX,
                            bg: statusCapMeta.bg,
                            color: statusCapMeta.color,
                          }}
                        >
                          {statusCapMeta.label}
                        </Box>
                      )}
                      {showDateBadge && (
                        <Box
                          sx={{
                            display: isGridDesktop
                              ? ["flex", "flex", "flex", "flex"]
                              : ["flex", "flex", "none", "none"],
                            position: "absolute",
                            right: ["16px", "18px", "20px", "20px"],
                            bottom: ["16px", "18px", "20px", "20px"],
                            border: "1px solid",
                            borderColor: "rgba(15, 23, 42, 0.18)",
                            borderRadius: "12px",
                            backgroundColor: "white",
                            minWidth: "74px",
                            px: ["0.8rem", "0.85rem", "0.9rem", "0.9rem"],
                            py: ["0.45rem", "0.5rem", "0.55rem", "0.55rem"],
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box sx={{ textAlign: "center" }}>
                            <Text
                              sx={{
                                variant: "text.label",
                                color: "darkgray",
                                display: "block",
                              }}
                            >
                              {format(parseISO(roleDate), "MMM")}
                            </Text>
                            <Text sx={{ variant: "styles.h3", lineHeight: 1 }}>
                              {format(parseISO(roleDate), "d")}
                            </Text>
                          </Box>
                        </Box>
                      )}
                    </Box>
                    <Box
                      sx={{
                        px: isGridDesktop
                          ? ["1rem", "1.15rem", "1.1rem", "1.1rem"]
                          : ["1rem", "1.15rem", "1.5rem", "1.5rem"],
                        py: isGridDesktop
                          ? ["0.9rem", "1rem", "1.05rem", "1.05rem"]
                          : ["0.9rem", "1rem", "1.5rem", "1.5rem"],
                        flex: isGridDesktop
                          ? "1 1 auto"
                          : ["1 1 100%", "1 1 100%", "1 1 60%"],
                        display: "flex",
                        flexDirection: "column",
                        gap: ["0.35rem", "0.4rem", "0.5rem", "0.5rem"],
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: ["0.35rem", "0.4rem", "0.5rem", "0.5rem"],
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
                      <Flex
                        sx={{
                          alignItems: [
                            "stretch",
                            "stretch",
                            isGridDesktop ? "stretch" : "flex-start",
                            isGridDesktop ? "stretch" : "flex-start",
                          ],
                          justifyContent: isGridDesktop
                            ? "flex-start"
                            : "space-between",
                          gap: ["0.35rem", "0.4rem", "0.85rem", "0.85rem"],
                          flexDirection: isGridDesktop
                            ? ["column", "column", "column", "column"]
                            : "row",
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
                          <Heading as="h3" sx={{ variant: "styles.h3", mb: 0 }}>
                            {getPositionTitle(role)}
                          </Heading>
                          {hasAssignedEvent &&
                            role?.motorsportRegEvent?.name && (
                              <Text
                                sx={{ fontSize: "20px", color: "darkgray" }}
                              >
                                {role.motorsportRegEvent.name}
                              </Text>
                            )}
                          {!hasAssignedEvent && roleDescription && (
                            <Text sx={{ fontSize: "20px", color: "darkgray" }}>
                              {roleDescription}
                            </Text>
                          )}
                        </Box>
                        {showDateBadge && (
                          <Box
                            sx={{
                              display:
                                showDateBadge && !isGridDesktop
                                  ? ["none", "none", "flex", "flex"]
                                  : "none",
                              flex: "0 0 auto",
                              border: "1px solid",
                              borderColor: "rgba(15, 23, 42, 0.18)",
                              borderRadius: "12px",
                              backgroundColor: "white",
                              px: "0.9rem",
                              py: "0.45rem",
                              minWidth: "74px",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Box sx={{ textAlign: "center" }}>
                              <Text
                                sx={{
                                  variant: "text.label",
                                  color: "darkgray",
                                  display: "block",
                                }}
                              >
                                {format(parseISO(roleDate), "MMM")}
                              </Text>
                              <Text
                                sx={{ variant: "styles.h3", lineHeight: 1 }}
                              >
                                {format(parseISO(roleDate), "d")}
                              </Text>
                            </Box>
                          </Box>
                        )}
                      </Flex>
                      {(showVenueOnCard || secondaryMetaParts.length > 0) && (
                        <Flex
                          sx={{
                            display: ["none", "none", "flex", "flex"],
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
        {!isLoading && rolesByStatus.length === 0 && (
          <Box sx={{ mt: "1.5rem", color: "darkgray" }}>
            {statusFilter === "active"
              ? "No volunteer positions are active right now."
              : "No volunteer positions are available yet."}
          </Box>
        )}
        {!isLoading &&
          rolesByStatus.length > 0 &&
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
