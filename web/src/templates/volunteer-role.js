/** @jsxImportSource theme-ui */
import React from "react";
import { graphql, Link } from "gatsby";
import { Box, Button, Card, Flex, Heading, Text } from "@theme-ui/components";
import { Alert } from "theme-ui";
import ReactMapGL, { Marker } from "react-map-gl";
import { format, parseISO } from "date-fns";
import GraphQLErrorList from "../components/graphql-error-list";
import Seo from "../components/seo";
import Layout from "../containers/layout";
import ContentContainer from "../components/content-container";
import StylizedLandingHeader from "../components/stylized-landing-header";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import { BoxIcon } from "../components/box-icons";
import { FiHelpCircle, FiMaximize2, FiShare2, FiX } from "react-icons/fi";
import {
  FaCalendarPlus,
  FaCheckCircle,
  FaClock,
  FaAward,
  FaGlobe,
  FaIdBadge,
  FaMapMarkerAlt,
  FaBan,
  FaTools,
  FaUserPlus,
  FaBriefcase,
  FaUsers,
} from "react-icons/fa";
import { getVolunteerRoleUrl, mapEdgesToNodes } from "../lib/helpers";
import { Client } from "../services/FetchClient";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";
import {
  getVolunteerRoleIconComponent,
  getVolunteerRolePresentationColor,
} from "../lib/volunteerRolePresentation";

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

const formatDateTime = (value) => {
  if (!value) return null;
  try {
    return format(parseISO(value), "MMM d, yyyy h:mm a");
  } catch (_) {
    return null;
  }
};

const toDateToken = (value) => {
  if (!value) return null;
  return String(value).slice(0, 10);
};

const isVolunteerPositionActive = (position, todayToken) => {
  if (position?.active === false) return false;
  const positionEvent = position?.motorsportRegEvent;
  const hasAssignedEvent = Boolean(
    positionEvent &&
      (positionEvent?.eventId ||
        positionEvent?.name ||
        positionEvent?.start ||
        positionEvent?.url ||
        positionEvent?.venueName ||
        positionEvent?.venueCity ||
        positionEvent?.venueRegion)
  );

  if (!hasAssignedEvent) return true;

  const eventDateToken =
    toDateToken(positionEvent?.start) || toDateToken(position?.date);
  if (!eventDateToken || !todayToken || eventDateToken <= todayToken) {
    return false;
  }

  const registrationEndToken = toDateToken(positionEvent?.registrationEnd);
  if (!registrationEndToken) return true;
  return registrationEndToken >= todayToken;
};

const formatDateRange = (start, end) => {
  const startLabel = formatDate(start);
  const endLabel = formatDate(end);
  if (!startLabel) return null;
  if (!endLabel || endLabel === startLabel) return startLabel;
  return `${startLabel} – ${endLabel}`;
};

const parseCalendarDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const REQUIRED_FIELD_CHECK_SX = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "auto",
  height: "auto",
  color: "#1f7a3f",
  ml: "0.4rem",
  verticalAlign: "middle",
};

const toGoogleCalendarStamp = (value) =>
  value
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

const escapeIcsText = (value = "") =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

const buildIcsPayload = ({ title, description, location, start, end, url }) => {
  const uid = `${Date.now()}-psr@bmwccapsr.org`;
  const createdAt = toGoogleCalendarStamp(new Date());
  const startAt = toGoogleCalendarStamp(start);
  const endAt = toGoogleCalendarStamp(end);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BMW CCA PSR//Volunteer//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${createdAt}`,
    `DTSTART:${startAt}`,
    `DTEND:${endAt}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    url ? `URL:${escapeIcsText(url)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
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
  return value;
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

const formatVolunteerPoints = (value) => {
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 0) return null;
  return `${count} Point${count === 1 ? "" : "s"}`;
};

const APPLICATION_STATUS_META = {
  submitted: { label: "Submitted", bg: "#e8f7ec", color: "#2f9e44" },
  assigned: { label: "Assigned", bg: "#dff3e6", color: "#1f7a3f" },
  denied: { label: "Rejected", bg: "#fde8e8", color: "#9a1f1f" },
  rejected: { label: "Rejected", bg: "#fde8e8", color: "#9a1f1f" },
  withdrawn: { label: "Withdrawn", bg: "#fff6d5", color: "#8b6b00" },
  expired: { label: "Closed", bg: "#fde8e8", color: "#9a1f1f" },
};

const getApplicationStatusMeta = (value) => {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  return (
    APPLICATION_STATUS_META[key] || {
      label: key ? key[0].toUpperCase() + key.slice(1) : "Submitted",
      bg: "#e8f7ec",
      color: "#1f7a3f",
    }
  );
};

const APPLICATION_SASH_META = {
  submitted: { label: "Submitted", bg: "#2f9e44", color: "white" },
  assigned: { label: "Assigned", bg: "#1f7a3f", color: "white" },
  withdrawn: { label: "Withdrawn", bg: "#f4c430", color: "#1f1f1f" },
  denied: { label: "Rejected", bg: "#9a1f1f", color: "white" },
  rejected: { label: "Rejected", bg: "#9a1f1f", color: "white" },
};

const FILLED_SASH_META = {
  label: "Filled",
  bg: "#6b7280",
  color: "white",
};

const DEFAULT_MAPBOX_PUBLIC_TOKEN =
  "pk.eyJ1IjoiZWJveDg2IiwiYSI6ImNpajViaWg4ODAwNWp0aG0zOHlxNjh3ZzcifQ.OxQI3tKViy-IIIOrLABCPQ";
const VOLUNTEER_POSITION_MAP_STYLE =
  "mapbox://styles/ebox86/cmlx98cji000q01qqbnvk3al6";
const VOLUNTEER_POSITION_MAP_FALLBACK_STYLE =
  "mapbox://styles/mapbox/light-v11";
const VOLUNTEER_APPS_API_URL = (
  process.env.GATSBY_VOLUNTEER_APPS_API_URL || ""
).trim();
const getApplicationSessionStorageKey = (positionId) =>
  positionId ? `volunteerApplicationSession:${positionId}` : null;
const getPointsBannerSessionStorageKey = (positionId) =>
  positionId ? `volunteerPointsBannerDismissed:${positionId}` : null;
const normalizeManageQueryValue = (value) => String(value || "").trim();

const PositionEventMap = ({
  latitude,
  longitude,
  title,
  token,
  showZoomControls = true,
  height = ["220px", "240px", "260px"],
}) => {
  const [viewport, setViewport] = React.useState({
    latitude,
    longitude,
    zoom: 13.8,
  });
  const [activeMapStyle, setActiveMapStyle] = React.useState(
    VOLUNTEER_POSITION_MAP_STYLE
  );
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    setViewport((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  }, [latitude, longitude]);
  React.useEffect(() => {
    setActiveMapStyle(VOLUNTEER_POSITION_MAP_STYLE);
  }, []);

  const fallbackToLegacyStyle = React.useCallback(() => {
    setActiveMapStyle((prev) =>
      prev === VOLUNTEER_POSITION_MAP_FALLBACK_STYLE
        ? prev
        : VOLUNTEER_POSITION_MAP_FALLBACK_STYLE
    );
  }, []);

  const handleZoomIn = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.min((prev.zoom || 13.8) + 0.75, 18),
    }));
  };

  const handleZoomOut = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.max((prev.zoom || 13.8) - 0.75, 8),
    }));
  };

  const handleMapError = React.useCallback(() => {
    fallbackToLegacyStyle();
  }, [fallbackToLegacyStyle]);

  const closeExpandedMap = React.useCallback(() => {
    setIsExpanded(false);
  }, []);

  React.useEffect(() => {
    if (
      !isExpanded ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    ) {
      return undefined;
    }
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
    };
    const previousHtmlOverflowY = document.documentElement.style.overflowY;

    document.documentElement.style.overflowY = "scroll";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsExpanded(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.documentElement.style.overflowY = previousHtmlOverflowY;
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.left = previousBodyStyles.left;
      document.body.style.right = previousBodyStyles.right;
      document.body.style.width = previousBodyStyles.width;
      window.scrollTo(scrollX, scrollY);
    };
  }, [isExpanded]);

  const renderMap = ({
    interactive,
    controlsTop = "8px",
    controlsVisible = showZoomControls,
  }) => (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        "& .mapboxgl-canvas": {
          cursor: interactive ? "grab" : "default !important",
        },
      }}
    >
      <ReactMapGL
        {...viewport}
        style={{ width: "100%", height: "100%" }}
        mapboxAccessToken={token}
        mapStyle={activeMapStyle}
        onError={handleMapError}
        onMove={(event) => setViewport(event.viewState)}
        dragPan={interactive}
        scrollZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        dragRotate={false}
        doubleClickZoom={interactive}
        touchZoomRotate={interactive}
        cursor={interactive ? "grab" : "default"}
      >
        <Marker
          latitude={latitude}
          longitude={longitude}
          captureClick={false}
          draggable={false}
          anchor="bottom"
        >
          <Box
            as="span"
            aria-label={title ? `Location for ${title}` : "Event location"}
            sx={{
              display: "inline-flex",
              lineHeight: 0,
              pointerEvents: "none",
            }}
          >
            <FaMapMarkerAlt size={30} color="#1e94ff" aria-hidden="true" />
          </Box>
        </Marker>
      </ReactMapGL>
      {controlsVisible && (
        <Flex
          sx={{
            position: "absolute",
            top: controlsTop,
            right: "8px",
            flexDirection: "column",
            gap: 0,
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "black",
            boxShadow: "0 8px 16px rgba(0,0,0,0.14)",
            zIndex: "9999",
            pointerEvents: "auto",
            backgroundColor: "rgba(255,255,255,0.95)",
          }}
        >
          <Box
            as="button"
            type="button"
            aria-label="Zoom in"
            onClick={handleZoomIn}
            sx={{
              width: "38px",
              height: "38px",
              backgroundColor: "white",
              color: "black",
              border: 0,
              borderBottom: "1px solid",
              borderBottomColor: "black",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "24px",
              fontWeight: "bold",
              lineHeight: 1,
              "&:hover": {
                backgroundColor: "lightgray",
                color: "primary",
              },
            }}
          >
            +
          </Box>
          <Box
            as="button"
            type="button"
            aria-label="Zoom out"
            onClick={handleZoomOut}
            sx={{
              width: "38px",
              height: "38px",
              backgroundColor: "white",
              color: "black",
              border: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "24px",
              fontWeight: "bold",
              lineHeight: 1,
              "&:hover": {
                backgroundColor: "lightgray",
                color: "primary",
              },
            }}
          >
            -
          </Box>
        </Flex>
      )}
    </Box>
  );

  if (typeof window === "undefined") return null;

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height,
          position: "relative",
        }}
      >
        {renderMap({
          interactive: false,
          controlsTop: "8px",
          controlsVisible: showZoomControls,
        })}
        <Box
          as="button"
          type="button"
          aria-label="Expand map"
          title="Expand map"
          onClick={() => setIsExpanded(true)}
          sx={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "black",
            bg: "rgba(255,255,255,0.95)",
            color: "text",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 5,
            "&:hover": {
              bg: "lightgray",
              color: "primary",
            },
          }}
        >
          <FiMaximize2 size={16} aria-hidden="true" />
        </Box>
      </Box>
      {isExpanded && (
        <Box
          role="dialog"
          aria-modal="true"
          aria-label={title ? `${title} map` : "Expanded map"}
          onClick={closeExpandedMap}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 12000,
            bg: "rgba(38, 42, 48, 0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: ["0.75rem", "1rem", "1.5rem"],
          }}
        >
          <Box
            onClick={(event) => event.stopPropagation()}
            sx={{
              width: ["100%", "100%", "92vw"],
              maxWidth: "1280px",
              height: ["78vh", "80vh", "84vh"],
              borderRadius: "18px",
              overflow: "hidden",
              border: "1px solid",
              borderColor: "black",
              bg: "white",
              position: "relative",
            }}
          >
            {renderMap({
              interactive: true,
              controlsTop: "56px",
              controlsVisible: true,
            })}
            <Box
              as="button"
              type="button"
              aria-label="Close expanded map"
              title="Close"
              onClick={closeExpandedMap}
              sx={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "40px",
                height: "40px",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: "black",
                bg: "rgba(255,255,255,0.95)",
                color: "text",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 8,
                "&:hover": {
                  bg: "lightgray",
                  color: "primary",
                },
              }}
            >
              <FiX size={20} aria-hidden="true" />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

const getPositionTitle = (position) =>
  position?.role?.name?.trim() || "Untitled role";

const formatCardPositionTitle = (value) => {
  const input = String(value || "").trim();
  if (!input) return "";
  const match = input.match(/^[^(]*\(([^)]+)\)\s*(.*)$/);
  if (!match) return input;
  const shortLabel = String(match[1] || "").trim();
  const suffix = String(match[2] || "").trim();
  if (!shortLabel) return input;
  return suffix ? `${shortLabel} ${suffix}` : shortLabel;
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
      _id
      role {
        name
        description
        detail
        pointValue
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
    otherRoles: allSanityVolunteerRole(
      filter: {
        id: { ne: $id }
        slug: { current: { ne: null } }
        active: { eq: true }
      }
      sort: { fields: [date], order: ASC }
      limit: 20
    ) {
      edges {
        node {
          id
          active
          membershipRequired
          role {
            name
            pointValue
            icon
            color
          }
          slug {
            current
          }
          date
          motorsportRegEvent {
            origin
            eventId
            name
            start
            registrationEnd
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

const VolunteerRoleTemplate = (props) => {
  const { data, errors } = props;
  const site = data?.site;
  const role = data?.role;
  const otherRoles = React.useMemo(
    () => (data?.otherRoles ? mapEdgesToNodes(data.otherRoles) : []),
    [data?.otherRoles]
  );
  const menuItems = site?.navMenu?.items || [];
  const sanity = React.useMemo(() => new Client(), []);
  const [resolvedRole, setResolvedRole] = React.useState(role?.role || null);
  const [resolvedEvent, setResolvedEvent] = React.useState(
    role?.motorsportRegEvent || null
  );
  const [resolvedRoleActive, setResolvedRoleActive] = React.useState(
    role?.active ?? null
  );
  const [assignedApplicationCount, setAssignedApplicationCount] =
    React.useState(null);
  const [resolvedEventCoordinates, setResolvedEventCoordinates] =
    React.useState(null);
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = React.useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);
  const [isApplySubmitting, setIsApplySubmitting] = React.useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = React.useState(false);
  const [showResetApplicationConfirm, setShowResetApplicationConfirm] =
    React.useState(false);
  const [isWithdrawProcessing, setIsWithdrawProcessing] = React.useState(false);
  const [isResetProcessing, setIsResetProcessing] = React.useState(false);
  const [showPointsBanner, setShowPointsBanner] = React.useState(true);
  const [applyNoticeTone, setApplyNoticeTone] = React.useState("neutral");
  const [applyNotice, setApplyNotice] = React.useState("");
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastKey, setToastKey] = React.useState(0);
  const [managedApplication, setManagedApplication] = React.useState(null);
  const [manageLinkRequest, setManageLinkRequest] = React.useState(null);
  const [applyFormData, setApplyFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hasPerformedRoleBefore: null,
    referral: "",
    notes: "",
  });
  const calendarMenuRef = React.useRef(null);
  const toastTimeoutRef = React.useRef(null);
  const roleSlug = role?.slug?.current;
  const positionId = role?._id;
  const initialRoleActive = role?.active ?? null;
  const applicationStorageKey = React.useMemo(
    () => getApplicationSessionStorageKey(positionId),
    [positionId]
  );
  const pointsBannerStorageKey = React.useMemo(
    () => getPointsBannerSessionStorageKey(positionId),
    [positionId]
  );

  React.useEffect(() => {
    setResolvedRole(role?.role || null);
  }, [role?.role]);

  React.useEffect(() => {
    setResolvedEvent(role?.motorsportRegEvent || null);
  }, [role?.motorsportRegEvent]);

  React.useEffect(() => {
    setResolvedEvent(null);
    setResolvedEventCoordinates(null);
    setResolvedRoleActive(initialRoleActive);
    setAssignedApplicationCount(null);
    setIsCalendarMenuOpen(false);
    setIsApplyModalOpen(false);
    setIsApplySubmitting(false);
    setShowWithdrawConfirm(false);
    setShowResetApplicationConfirm(false);
    setIsWithdrawProcessing(false);
    setIsResetProcessing(false);
    setManagedApplication(null);
    setApplyNoticeTone("neutral");
    setApplyNotice("");
    setApplyFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      hasPerformedRoleBefore: null,
      referral: "",
      notes: "",
    });
  }, [initialRoleActive, roleSlug]);

  const persistManagedApplication = React.useCallback(
    (nextSession) => {
      setManagedApplication(nextSession || null);
      if (typeof window === "undefined" || !applicationStorageKey) {
        return;
      }
      try {
        if (!nextSession) {
          window.localStorage.removeItem(applicationStorageKey);
          return;
        }
        window.localStorage.setItem(
          applicationStorageKey,
          JSON.stringify(nextSession)
        );
      } catch (_error) {
        // ignore storage errors
      }
    },
    [applicationStorageKey]
  );

  React.useEffect(() => {
    if (typeof window === "undefined" || !applicationStorageKey) {
      return;
    }
    try {
      const rawValue = window.localStorage.getItem(applicationStorageKey);
      if (!rawValue) {
        setManagedApplication(null);
        return;
      }
      const parsed = JSON.parse(rawValue);
      if (!parsed || !parsed.applicationId) {
        setManagedApplication(null);
        return;
      }
      setManagedApplication(parsed);
    } catch (_error) {
      setManagedApplication(null);
    }
  }, [applicationStorageKey]);

  React.useEffect(() => {
    if (!isApplyModalOpen || !managedApplication?.applicationId) return;
    setApplyFormData({
      firstName: managedApplication.firstName || "",
      lastName: managedApplication.lastName || "",
      email: managedApplication.email || "",
      phone: managedApplication.phone || "",
      hasPerformedRoleBefore:
        typeof managedApplication.hasPerformedRoleBefore === "boolean"
          ? managedApplication.hasPerformedRoleBefore
          : null,
      referral: managedApplication.referral || "",
      notes: managedApplication.notes || "",
    });
  }, [isApplyModalOpen, managedApplication]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !roleSlug || !positionId) return;
    const params = new URLSearchParams(window.location.search);
    const shouldOpenManage = params.get("manage") === "1";
    const applicationId = normalizeManageQueryValue(
      params.get("applicationId")
    );
    const linkedPositionId = normalizeManageQueryValue(
      params.get("positionId")
    );
    const intent = normalizeManageQueryValue(
      params.get("intent")
    ).toLowerCase();

    if (!applicationId) {
      setManageLinkRequest(null);
      return;
    }
    if (linkedPositionId && linkedPositionId !== positionId) {
      setManageLinkRequest(null);
      return;
    }
    setManageLinkRequest({
      applicationId,
      positionId,
      intent: intent || "manage",
    });
    if (shouldOpenManage) {
      setIsApplyModalOpen(true);
    }
  }, [positionId, roleSlug]);

  React.useEffect(() => {
    if (!roleSlug) return;
    let isMounted = true;
    sanity
      .fetchVolunteerPositionBySlug(roleSlug)
      .then((result) => {
        if (!isMounted) return;
        if (typeof result?.active === "boolean") {
          setResolvedRoleActive(result.active);
        }
        if (Number.isFinite(Number(result?.assignedVolunteerCount))) {
          setAssignedApplicationCount(Number(result.assignedVolunteerCount));
        }
        if (result?.role) {
          setResolvedRole(result.role);
        }
        if (result?.motorsportRegEvent) {
          setResolvedEvent(result.motorsportRegEvent);
          setResolvedEventCoordinates({
            latitude:
              result.motorsportRegEvent.latitude ??
              result.motorsportRegEvent.lat ??
              null,
            longitude:
              result.motorsportRegEvent.longitude ??
              result.motorsportRegEvent.lng ??
              result.motorsportRegEvent.lon ??
              result.motorsportRegEvent.long ??
              null,
          });
        }
      })
      .catch(() => {
        if (!isMounted) return;
      });
    return () => {
      isMounted = false;
    };
  }, [sanity, roleSlug]);

  React.useEffect(() => {
    if (!isCalendarMenuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (
        calendarMenuRef.current &&
        !calendarMenuRef.current.contains(event.target)
      ) {
        setIsCalendarMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsCalendarMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isCalendarMenuOpen]);

  React.useEffect(() => {
    if (
      !isApplyModalOpen ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    ) {
      return undefined;
    }

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
    };
    const previousHtmlOverflowY = document.documentElement.style.overflowY;

    document.documentElement.style.overflowY = "scroll";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsApplyModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.documentElement.style.overflowY = previousHtmlOverflowY;
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.left = previousBodyStyles.left;
      document.body.style.right = previousBodyStyles.right;
      document.body.style.width = previousBodyStyles.width;
      window.scrollTo(scrollX, scrollY);
    };
  }, [isApplyModalOpen]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !pointsBannerStorageKey) {
      setShowPointsBanner(true);
      return;
    }
    try {
      const dismissedValue = window.sessionStorage.getItem(
        pointsBannerStorageKey
      );
      setShowPointsBanner(dismissedValue !== "1");
    } catch (_error) {
      setShowPointsBanner(true);
    }
  }, [pointsBannerStorageKey]);

  const autoDismissPointsBanner = React.useCallback(() => {
    setShowPointsBanner(false);
    if (typeof window === "undefined" || !pointsBannerStorageKey) return;
    try {
      window.sessionStorage.setItem(pointsBannerStorageKey, "1");
    } catch (_error) {
      // ignore storage errors
    }
  }, [pointsBannerStorageKey]);

  const dismissPointsBanner = React.useCallback(() => {
    autoDismissPointsBanner();
  }, [autoDismissPointsBanner]);

  const event = React.useMemo(
    () => ({
      ...(role?.motorsportRegEvent || {}),
      ...(resolvedEvent || {}),
    }),
    [role?.motorsportRegEvent, resolvedEvent]
  );
  const roleReference = resolvedRole || role?.role || null;
  const positionTitle = roleReference?.name?.trim() || "Untitled role";
  const shortPositionTitle =
    formatCardPositionTitle(positionTitle) || positionTitle;
  const PositionRoleIcon = getVolunteerRoleIconComponent(roleReference?.icon);
  const hasEventAssigned = Boolean(
    event &&
      (event?.eventId ||
        event?.name ||
        event?.start ||
        event?.url ||
        event?.venueName ||
        event?.venueCity ||
        event?.venueRegion)
  );
  const eventDateRange = formatDateRange(event?.start, event?.end);
  const roleDate = formatDate(role?.date);
  const imageUrl = normalizeImageUrl(event?.imageUrl);
  const venueLine = [event?.venueName, event?.venueCity, event?.venueRegion]
    .filter(Boolean)
    .join(", ");
  const registrationStartDate = parseCalendarDate(event?.registrationStart);
  const registrationEndDate = parseCalendarDate(event?.registrationEnd);
  const registrationEndLabel = formatDate(event?.registrationEnd);
  const hasRegistrationWindow = Boolean(
    registrationStartDate || registrationEndDate
  );
  const nowTime = Date.now();
  const isRegistrationOpen = hasRegistrationWindow
    ? (!registrationStartDate || nowTime >= registrationStartDate.getTime()) &&
      (!registrationEndDate || nowTime <= registrationEndDate.getTime())
    : null;
  const showRegistrationClosedBanner =
    hasRegistrationWindow && isRegistrationOpen === false;
  const shouldDisableEventMsrcLink =
    hasRegistrationWindow && isRegistrationOpen === false;
  const mapLatitude = Number.parseFloat(
    String(event?.latitude ?? resolvedEventCoordinates?.latitude ?? "")
  );
  const mapLongitude = Number.parseFloat(
    String(event?.longitude ?? resolvedEventCoordinates?.longitude ?? "")
  );
  const hasMapCoordinates =
    hasEventAssigned &&
    Number.isFinite(mapLatitude) &&
    Number.isFinite(mapLongitude);
  const mapboxToken =
    process.env.GATSBY_SANITY_MAPBOX_TOKEN || DEFAULT_MAPBOX_PUBLIC_TOKEN;
  const todayToken = React.useMemo(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }, []);
  const activeOtherRoles = React.useMemo(
    () =>
      otherRoles
        .filter((candidate) => isVolunteerPositionActive(candidate, todayToken))
        .slice(0, 2),
    [otherRoles, todayToken]
  );
  const showOtherRoles = activeOtherRoles.length > 0;
  const skillLevelLabel = formatSkillLevel(role?.skillLevel);
  const skillTone = getSkillTone(role?.skillLevel);
  const SkillLevelIcon = getSkillIcon(role?.skillLevel);
  const pointsLabel = formatVolunteerPoints(roleReference?.pointValue);
  const pointsValue = Number(roleReference?.pointValue);
  const pointStars =
    Number.isFinite(pointsValue) && pointsValue > 0 && pointsValue <= 5
      ? "★".repeat(pointsValue)
      : "";
  const isTenPointRole = pointsValue === 10;
  const pointsPillMinHeight = isTenPointRole ? "2.05em" : "1.35em";
  const hasDuration =
    role?.duration !== undefined &&
    role?.duration !== null &&
    role?.duration !== "";
  const durationValue = hasDuration ? Number(role.duration) : null;
  const durationLabel = hasDuration
    ? `${role.duration} hour${
        Number.isFinite(durationValue) && durationValue === 1 ? "" : "s"
      }`
    : "";
  const roleDescription = roleReference?.description?.trim() || "";
  const roleDetail = roleReference?.detail?.trim() || "";
  const positionDescription =
    roleReference?.description || roleReference?.detail || "";
  const isMsrManagedVolunteerEvent =
    String(event?.origin || "")
      .trim()
      .toLowerCase() === "msr";
  const valueTextSize = "xs";
  const calendarStartDate =
    parseCalendarDate(event?.start) || parseCalendarDate(role?.date);
  const calendarEndDate = parseCalendarDate(event?.end);
  const defaultCalendarEndDate = calendarStartDate
    ? new Date(calendarStartDate.getTime() + 2 * 60 * 60 * 1000)
    : null;
  const finalCalendarEndDate =
    calendarEndDate && calendarStartDate && calendarEndDate > calendarStartDate
      ? calendarEndDate
      : defaultCalendarEndDate;
  const calendarTitle = event?.name || positionTitle || "BMW CCA PSR Event";
  const calendarDescription = `Volunteer position: ${positionTitle}${
    roleDate ? ` on ${roleDate}` : ""
  }`;
  const hasCalendarData =
    Boolean(calendarStartDate) && Boolean(finalCalendarEndDate);
  const googleCalendarUrl = hasCalendarData
    ? `https://calendar.google.com/calendar/render?${new URLSearchParams({
        action: "TEMPLATE",
        text: calendarTitle,
        details: calendarDescription,
        location: venueLine || "",
        dates: `${toGoogleCalendarStamp(
          calendarStartDate
        )}/${toGoogleCalendarStamp(finalCalendarEndDate)}`,
      }).toString()}`
    : null;
  const outlookCalendarUrl = hasCalendarData
    ? `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams(
        {
          path: "/calendar/action/compose",
          rru: "addevent",
          subject: calendarTitle,
          body: calendarDescription,
          location: venueLine || "",
          startdt: calendarStartDate.toISOString(),
          enddt: finalCalendarEndDate.toISOString(),
        }
      ).toString()}`
    : null;

  const handleDownloadIcs = React.useCallback(() => {
    if (!hasCalendarData || typeof window === "undefined") return;
    const fileBody = buildIcsPayload({
      title: calendarTitle,
      description: calendarDescription,
      location: venueLine || "",
      start: calendarStartDate,
      end: finalCalendarEndDate,
      url: event?.url || window.location.href,
    });
    const blob = new Blob([fileBody], {
      type: "text/calendar;charset=utf-8",
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${
      calendarTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "event"
    }.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }, [
    calendarDescription,
    calendarStartDate,
    calendarTitle,
    event?.url,
    finalCalendarEndDate,
    hasCalendarData,
    venueLine,
  ]);

  const handleShare = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    const shareUrl = window.location.href;
    const shareText = `Hey, check out this new volunteer opportunity with BMW CCA PSR: ${positionTitle}.`;
    const shareMessage = `${shareText}\n${shareUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Volunteer Opportunity: ${positionTitle}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (_) {
        return;
      }
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareMessage);
      } catch (_) {
        // no-op: clipboard may be blocked in some contexts
      }
    }
  }, [positionTitle]);

  const handleApplyFieldChange = React.useCallback(
    (field) => {
      return (event) => {
        const value = event?.currentTarget?.value || "";
        setApplyFormData((prev) => ({
          ...prev,
          [field]: value,
        }));
        if (applyNotice) {
          setApplyNotice("");
          setApplyNoticeTone("neutral");
        }
      };
    },
    [applyNotice]
  );

  const handleApplyPerformedRoleBeforeChange = React.useCallback(
    (value) => {
      return () => {
        setApplyFormData((prev) => ({
          ...prev,
          hasPerformedRoleBefore:
            prev.hasPerformedRoleBefore === value ? null : value,
        }));
        if (applyNotice) {
          setApplyNotice("");
          setApplyNoticeTone("neutral");
        }
      };
    },
    [applyNotice]
  );

  const isApplyEmailValid = React.useMemo(() => {
    const email = applyFormData.email.trim();
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [applyFormData.email]);

  const isApplyFormValid = React.useMemo(() => {
    const hasFirstName = Boolean(applyFormData.firstName.trim());
    const hasLastName = Boolean(applyFormData.lastName.trim());
    const hasRoleExperienceSelection =
      typeof applyFormData.hasPerformedRoleBefore === "boolean";
    return (
      hasFirstName &&
      hasLastName &&
      isApplyEmailValid &&
      hasRoleExperienceSelection
    );
  }, [
    applyFormData.firstName,
    applyFormData.lastName,
    applyFormData.hasPerformedRoleBefore,
    isApplyEmailValid,
  ]);
  const hasManagedApplication = Boolean(managedApplication?.applicationId);
  const managedStatusKey = String(managedApplication?.status || "")
    .trim()
    .toLowerCase();
  const positionActive =
    typeof resolvedRoleActive === "boolean" ? resolvedRoleActive : role?.active;
  const hasAssignedVolunteer =
    Number.isFinite(Number(assignedApplicationCount)) &&
    Number(assignedApplicationCount) > 0;
  const isNonEventFilled =
    !hasEventAssigned &&
    !hasManagedApplication &&
    (positionActive === false || hasAssignedVolunteer);
  const isManagedApplicationAssigned = managedStatusKey === "assigned";
  const managedSashMeta =
    APPLICATION_SASH_META[managedStatusKey] ||
    (managedStatusKey === "denied" ? APPLICATION_SASH_META.rejected : null);
  const sashMeta =
    managedSashMeta || (isNonEventFilled ? FILLED_SASH_META : null);
  const showStatusSash = Boolean(sashMeta);
  const isWithdrawnState = managedStatusKey === "withdrawn";
  const isManagedApplicationRejected =
    managedStatusKey === "denied" || managedStatusKey === "rejected";
  const isManagedApplicationImmutable =
    isManagedApplicationAssigned ||
    isManagedApplicationRejected ||
    managedStatusKey === "withdrawn" ||
    managedStatusKey === "expired";
  const managedRejectedReasonPublic = normalizeManageQueryValue(
    managedApplication?.rejectedReasonPublic
  );
  const managedApplicationStatus = getApplicationStatusMeta(
    managedApplication?.status
  );
  const managedApplicationSubmittedLabel = formatDateTime(
    managedApplication?.submittedAt
  );
  const shouldDisableApply = isMsrManagedVolunteerEvent || isNonEventFilled;
  const isManagedFormDirty = React.useMemo(() => {
    if (!hasManagedApplication) return false;
    return (
      applyFormData.firstName.trim() !==
        String(managedApplication?.firstName || "").trim() ||
      applyFormData.lastName.trim() !==
        String(managedApplication?.lastName || "").trim() ||
      applyFormData.email.trim().toLowerCase() !==
        String(managedApplication?.email || "")
          .trim()
          .toLowerCase() ||
      applyFormData.phone.trim() !==
        String(managedApplication?.phone || "").trim() ||
      applyFormData.referral.trim() !==
        String(managedApplication?.referral || "").trim() ||
      applyFormData.notes.trim() !==
        String(managedApplication?.notes || "").trim() ||
      applyFormData.hasPerformedRoleBefore !==
        managedApplication?.hasPerformedRoleBefore
    );
  }, [applyFormData, hasManagedApplication, managedApplication]);
  const isApplySuccessState =
    applyNoticeTone === "success" && !isApplySubmitting;
  const canWithdrawManagedApplication =
    hasManagedApplication && managedStatusKey === "submitted";
  const isApplyFormReadOnly =
    isApplySuccessState || isManagedApplicationImmutable;
  const shouldShowUpdateLabel =
    hasManagedApplication && managedStatusKey === "submitted";
  const canSubmitApplyForm =
    isApplyFormValid &&
    !isApplySubmitting &&
    !isApplySuccessState &&
    !isManagedApplicationImmutable &&
    (!hasManagedApplication || isManagedFormDirty);

  const showToast = React.useCallback((message) => {
    if (toastTimeoutRef.current && typeof window !== "undefined") {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToastMessage(message || "");
    setToastKey((prev) => prev + 1);
    if (typeof window !== "undefined") {
      toastTimeoutRef.current = window.setTimeout(() => {
        setToastMessage("");
        toastTimeoutRef.current = null;
      }, 2600);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (toastTimeoutRef.current && typeof window !== "undefined") {
        window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  const handleWithdrawApplication = React.useCallback(async () => {
    if (!hasManagedApplication || isApplySubmitting) return;
    if (!canWithdrawManagedApplication) return;
    if (!VOLUNTEER_APPS_API_URL) {
      setApplyNoticeTone("error");
      setApplyNotice(
        "Applications API is not configured. Set GATSBY_VOLUNTEER_APPS_API_URL."
      );
      return;
    }
    setShowWithdrawConfirm(false);
    setIsWithdrawProcessing(true);
    setApplyNotice("");
    setApplyNoticeTone("neutral");
    try {
      const response = await fetch(
        `${VOLUNTEER_APPS_API_URL.replace(/\/+$/, "")}/applications/withdraw`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            positionId,
            applicationId: managedApplication?.applicationId,
          }),
        }
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        const details =
          payload?.details || payload?.error || "Unknown withdrawal error.";
        throw new Error(details);
      }
      persistManagedApplication({
        ...managedApplication,
        status: "withdrawn",
      });
      autoDismissPointsBanner();
      setApplyNoticeTone("neutral");
      setApplyNotice("");
      setApplyFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        hasPerformedRoleBefore: null,
        referral: "",
        notes: "",
      });
      setIsApplyModalOpen(false);
      showToast("Application withdrawn.");
    } catch (error) {
      setApplyNoticeTone("error");
      setApplyNotice(
        error?.message ||
          "We couldn’t withdraw your application right now. Please try again."
      );
    } finally {
      setIsWithdrawProcessing(false);
    }
  }, [
    autoDismissPointsBanner,
    canWithdrawManagedApplication,
    hasManagedApplication,
    isApplySubmitting,
    managedApplication,
    persistManagedApplication,
    positionId,
    showToast,
  ]);

  const loadManagedApplication = React.useCallback(
    async (applicationIdToLoad, intent = "manage", options = {}) => {
      const shouldShowBusy = options?.showBusy !== false;
      const shouldHydrateForm = options?.hydrateForm !== false;
      if (!VOLUNTEER_APPS_API_URL || !applicationIdToLoad || !positionId)
        return;
      if (shouldShowBusy) setIsApplySubmitting(true);
      try {
        const response = await fetch(
          `${VOLUNTEER_APPS_API_URL.replace(/\/+$/, "")}/applications/actions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "load",
              positionId,
              applicationId: applicationIdToLoad,
            }),
          }
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.ok || !payload?.application) {
          return;
        }
        const loaded = payload.application;
        const session = {
          positionId,
          applicationId: loaded.applicationId || applicationIdToLoad,
          status: loaded.status || "submitted",
          submittedAt: loaded.submittedAt || null,
          rejectedReasonPublic: loaded.rejectedReasonPublic || "",
          rejectedReasonInternal: loaded.rejectedReasonInternal || "",
          firstName: loaded.firstName || "",
          lastName: loaded.lastName || "",
          email: loaded.email || "",
          phone: loaded.phone || "",
          referral: loaded.referral || "",
          notes: loaded.notes || "",
          hasPerformedRoleBefore:
            typeof loaded.hasPerformedRoleBefore === "boolean"
              ? loaded.hasPerformedRoleBefore
              : null,
        };
        persistManagedApplication(session);
        if (shouldHydrateForm) {
          setApplyFormData({
            firstName: session.firstName,
            lastName: session.lastName,
            email: session.email,
            phone: session.phone,
            hasPerformedRoleBefore: session.hasPerformedRoleBefore,
            referral: session.referral,
            notes: session.notes,
          });
        }
        if (intent === "withdraw") {
          setApplyNoticeTone("neutral");
          setApplyNotice("This application can be withdrawn below.");
        }
      } finally {
        if (shouldShowBusy) setIsApplySubmitting(false);
      }
    },
    [persistManagedApplication, positionId]
  );

  React.useEffect(() => {
    if (!isApplyModalOpen || !manageLinkRequest?.applicationId || !positionId) {
      return;
    }
    let isCancelled = false;
    loadManagedApplication(
      manageLinkRequest.applicationId,
      manageLinkRequest.intent
    ).finally(() => {
      if (isCancelled) return;
      setManageLinkRequest(null);
    });
    return () => {
      isCancelled = true;
    };
  }, [isApplyModalOpen, loadManagedApplication, manageLinkRequest, positionId]);

  React.useEffect(() => {
    if (
      isApplyModalOpen ||
      !managedApplication?.applicationId ||
      !positionId ||
      !VOLUNTEER_APPS_API_URL
    ) {
      return;
    }
    loadManagedApplication(managedApplication.applicationId, "manage", {
      showBusy: false,
      hydrateForm: false,
    });
  }, [
    isApplyModalOpen,
    loadManagedApplication,
    managedApplication?.applicationId,
    positionId,
  ]);

  React.useEffect(() => {
    if (
      !isApplyModalOpen ||
      !managedApplication?.applicationId ||
      Boolean(manageLinkRequest?.applicationId)
    ) {
      return;
    }
    loadManagedApplication(managedApplication.applicationId, "manage");
  }, [
    isApplyModalOpen,
    loadManagedApplication,
    manageLinkRequest?.applicationId,
    managedApplication?.applicationId,
  ]);

  const handleCloseApplyModal = React.useCallback(() => {
    if (isWithdrawProcessing) return;
    setIsApplyModalOpen(false);
    setIsApplySubmitting(false);
    setShowWithdrawConfirm(false);
    setShowResetApplicationConfirm(false);
    setApplyNotice("");
    setApplyNoticeTone("neutral");
    setIsResetProcessing(false);
  }, [isWithdrawProcessing]);

  const handleResetManagedApplication = React.useCallback(async () => {
    if (isWithdrawProcessing) return;
    if (!managedApplication?.applicationId || !positionId) {
      persistManagedApplication(null);
      setManagedApplication(null);
      setApplyFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        hasPerformedRoleBefore: null,
        referral: "",
        notes: "",
      });
      setApplyNotice("");
      setApplyNoticeTone("neutral");
      setShowWithdrawConfirm(false);
      setShowResetApplicationConfirm(false);
      setIsApplyModalOpen(false);
      return;
    }
    if (!VOLUNTEER_APPS_API_URL) {
      setApplyNoticeTone("error");
      setApplyNotice(
        "Applications API is not configured. Set GATSBY_VOLUNTEER_APPS_API_URL."
      );
      return;
    }

    setIsResetProcessing(true);
    setIsWithdrawProcessing(true);
    setApplyNotice("");
    setApplyNoticeTone("neutral");
    try {
      const response = await fetch(
        `${VOLUNTEER_APPS_API_URL.replace(/\/+$/, "")}/applications/withdraw`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            positionId,
            applicationId: managedApplication.applicationId,
          }),
        }
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        const details =
          payload?.details || payload?.error || "Unknown reset error.";
        throw new Error(details);
      }

      persistManagedApplication(null);
      setManagedApplication(null);
      setApplyFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        hasPerformedRoleBefore: null,
        referral: "",
        notes: "",
      });
      setApplyNotice("");
      setApplyNoticeTone("neutral");
      setShowWithdrawConfirm(false);
      setShowResetApplicationConfirm(false);
      setIsApplyModalOpen(false);
      autoDismissPointsBanner();
      showToast("Application reset.");
    } catch (error) {
      setApplyNoticeTone("error");
      setApplyNotice(
        error?.message ||
          "We couldn’t reset your application right now. Please try again."
      );
    } finally {
      setIsWithdrawProcessing(false);
      setIsResetProcessing(false);
    }
  }, [
    autoDismissPointsBanner,
    isWithdrawProcessing,
    managedApplication?.applicationId,
    persistManagedApplication,
    positionId,
    showToast,
  ]);

  const handleApplySubmit = React.useCallback(
    async (event) => {
      event.preventDefault();
      if (!canSubmitApplyForm) return;

      if (!positionId) {
        setApplyNoticeTone("error");
        setApplyNotice("Unable to submit application: missing position ID.");
        return;
      }
      if (!VOLUNTEER_APPS_API_URL) {
        setApplyNoticeTone("error");
        setApplyNotice(
          "Applications API is not configured. Set GATSBY_VOLUNTEER_APPS_API_URL."
        );
        return;
      }

      setIsApplySubmitting(true);
      setApplyNotice("");
      setApplyNoticeTone("neutral");
      try {
        const endpoint = hasManagedApplication
          ? `${VOLUNTEER_APPS_API_URL.replace(/\/+$/, "")}/applications/actions`
          : `${VOLUNTEER_APPS_API_URL.replace(/\/+$/, "")}/applications`;
        const payloadBody = {
          positionId,
          applicationId: managedApplication?.applicationId || undefined,
          action: hasManagedApplication ? "update" : undefined,
          firstName: applyFormData.firstName.trim(),
          lastName: applyFormData.lastName.trim(),
          email: applyFormData.email.trim(),
          phone: applyFormData.phone.trim(),
          notes: applyFormData.notes.trim(),
          referral: applyFormData.referral.trim(),
          hasPerformedRoleBefore: applyFormData.hasPerformedRoleBefore,
        };
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payloadBody),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.ok) {
          const details =
            payload?.details || payload?.error || "Unknown submission error.";
          throw new Error(details);
        }

        const nextSession = {
          positionId,
          applicationId:
            payload?.application?.applicationId ||
            managedApplication?.applicationId ||
            null,
          status: payload?.application?.status || "submitted",
          submittedAt:
            payload?.application?.submittedAt ||
            managedApplication?.submittedAt ||
            new Date().toISOString(),
          rejectedReasonPublic:
            payload?.application?.rejectedReasonPublic ||
            managedApplication?.rejectedReasonPublic ||
            "",
          rejectedReasonInternal:
            payload?.application?.rejectedReasonInternal ||
            managedApplication?.rejectedReasonInternal ||
            "",
          firstName: applyFormData.firstName.trim(),
          lastName: applyFormData.lastName.trim(),
          email: applyFormData.email.trim(),
          phone: applyFormData.phone.trim(),
          referral: applyFormData.referral.trim(),
          notes: applyFormData.notes.trim(),
          hasPerformedRoleBefore: applyFormData.hasPerformedRoleBefore,
        };
        persistManagedApplication(nextSession);
        autoDismissPointsBanner();
        setApplyNoticeTone("success");
        if (hasManagedApplication) {
          setApplyNotice("Application updated.");
          showToast("Application updated.");
        } else if (payload?.deduped) {
          setApplyNotice(
            "You already have an active application for this position. We’ve kept your existing submission."
          );
          showToast("Application already on file.");
        } else {
          setApplyNotice(
            "Application submitted. You should receive a confirmation email shortly."
          );
          showToast("Application submitted.");
        }
      } catch (error) {
        setApplyNoticeTone("error");
        setApplyNotice(
          error?.message ||
            "We couldn’t submit your application right now. Please try again."
        );
      } finally {
        setIsApplySubmitting(false);
      }
    },
    [
      autoDismissPointsBanner,
      applyFormData,
      canSubmitApplyForm,
      hasManagedApplication,
      managedApplication?.applicationId,
      managedApplication?.rejectedReasonInternal,
      managedApplication?.rejectedReasonPublic,
      managedApplication?.submittedAt,
      persistManagedApplication,
      positionId,
      showToast,
    ]
  );

  const iconActionButtonSx = {
    width: "44px",
    height: "42px",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: "lightgray",
    backgroundColor: "lightgray",
    color: "text",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    cursor: "pointer",
    transition: "background-color 150ms ease, color 150ms ease",
    "&:hover": {
      backgroundColor: "#d8d8d8",
      color: "primary",
    },
  };

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
            Volunteer position not found
          </Heading>
          <Text sx={{ color: "darkgray", mt: "0.5rem" }}>
            This volunteer position is no longer available.
          </Text>
          <Link to="/volunteer" sx={{ mt: "1rem", display: "inline-block" }}>
            Back to volunteer positions
          </Link>
        </ContentContainer>
      </Layout>
    );
  }

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo
        title={positionTitle || "Volunteer position"}
        description={positionDescription}
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
            Positions
          </Text>
        </Box>
        <Heading
          as="h1"
          sx={{
            variant: "styles.h1",
            mt: 0,
            mb: "0.5rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {positionTitle}
          <BoxIcon
            as="span"
            sx={{
              display: "inline-grid",
              ml: "0.5rem",
              verticalAlign: "middle",
            }}
          />
        </Heading>
        <Flex
          sx={{
            mt: "2rem",
            gap: "1.5rem",
            flexDirection: ["column", "column", "row", "row"],
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              flex: ["1 1 100%", "1 1 100%", "1 1 45%"],
              display: "flex",
              flexDirection: "column",
            }}
          >
            {hasEventAssigned && imageUrl && (
              <Box
                sx={{
                  position: "relative",
                  borderRadius: "18px",
                  overflow: "hidden",
                  mb: "1rem",
                }}
              >
                <Box
                  as="img"
                  src={imageUrl}
                  alt={event?.name || positionTitle}
                  {...nonDraggableImageProps}
                  sx={{
                    width: "100%",
                    height: ["220px", "260px", "320px"],
                    objectFit: "cover",
                    display: "block",
                    ...nonDraggableImageSx,
                  }}
                />
                {showStatusSash && (
                  <Box
                    as="span"
                    sx={{
                      position: "absolute",
                      top: "44px",
                      left: "-82px",
                      width: "300px",
                      py: "0.62rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      bg: sashMeta.bg,
                      color: sashMeta.color,
                      fontSize: "18px",
                      fontWeight: "heading",
                      lineHeight: 1,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      transform: "rotate(-45deg)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                      pointerEvents: "none",
                    }}
                  >
                    {sashMeta.label}
                  </Box>
                )}
              </Box>
            )}
            {!hasEventAssigned && (
              <Box
                sx={{
                  display: ["flex", "flex", "flex"],
                  position: "relative",
                  width: "100%",
                  minHeight: ["220px", "260px", "320px"],
                  borderRadius: "18px",
                  overflow: "hidden",
                  mb: "1rem",
                }}
              >
                <Flex
                  sx={{
                    width: "100%",
                    minHeight: ["220px", "260px", "320px"],
                    bg: "black",
                    color: "white",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {PositionRoleIcon && (
                    <PositionRoleIcon size={96} aria-hidden="true" />
                  )}
                </Flex>
                {showStatusSash && (
                  <Box
                    as="span"
                    sx={{
                      position: "absolute",
                      top: "44px",
                      left: "-82px",
                      width: "300px",
                      py: "0.62rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      bg: sashMeta.bg,
                      color: sashMeta.color,
                      fontSize: "18px",
                      fontWeight: "heading",
                      lineHeight: 1,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      transform: "rotate(-45deg)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                      pointerEvents: "none",
                    }}
                  >
                    {sashMeta.label}
                  </Box>
                )}
              </Box>
            )}
            {hasEventAssigned ? (
              <Card
                sx={{
                  p: 0,
                  borderRadius: "18px",
                  border: "1px solid",
                  flex: "1 1 auto",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "secondary",
                    px: "1.25rem",
                    py: "0.65rem",
                    color: "white",
                  }}
                >
                  <Text
                    sx={{
                      variant: "text.label",
                      color: "white",
                    }}
                  >
                    Event detail
                  </Text>
                </Box>
                {showRegistrationClosedBanner && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      bg: "#f8d7da",
                      color: "#7f1d1d",
                      px: "1.25rem",
                      py: "0.7rem",
                      fontSize: "xs",
                      fontWeight: "heading",
                      lineHeight: 1.35,
                      borderBottom: "1px solid",
                      borderBottomColor: "rgba(127, 29, 29, 0.22)",
                    }}
                  >
                    <FaBan size={14} aria-hidden="true" />
                    <Text as="span" sx={{ color: "inherit" }}>
                      Registration is closed for this event.
                    </Text>
                  </Box>
                )}
                <Box
                  sx={{
                    px: "1.25rem",
                    pt: "0.85rem",
                    pb: "1.25rem",
                  }}
                >
                  {event?.name && (
                    <Text
                      as="div"
                      sx={{
                        m: 0,
                        fontSize: "sm",
                        fontWeight: "heading",
                        color: "text",
                      }}
                    >
                      {event.name}
                    </Text>
                  )}
                  {(eventDateRange || venueLine) && (
                    <Box
                      as="dl"
                      sx={{
                        mt: "0.85rem",
                        mb: 0,
                        display: "grid",
                        gridTemplateColumns: ["1fr", "1fr", "110px 1fr"],
                        columnGap: "1.35rem",
                        rowGap: "0.35rem",
                        "& dt": {
                          m: 0,
                          fontSize: "xs",
                          color: "gray",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        },
                        "& dd": {
                          m: 0,
                          fontSize: "sm",
                          color: "gray",
                        },
                        "& dd.event-detail-date-value": {
                          fontSize: valueTextSize,
                          color: "text",
                        },
                        "& dd.event-detail-location-value": {
                          fontSize: valueTextSize,
                          color: "text",
                        },
                      }}
                    >
                      {eventDateRange && (
                        <>
                          <Box as="dt">Date</Box>
                          <Box as="dd" className="event-detail-date-value">
                            {eventDateRange}
                          </Box>
                        </>
                      )}
                      {venueLine && (
                        <>
                          <Box as="dt">Location</Box>
                          <Box as="dd" className="event-detail-location-value">
                            {venueLine}
                          </Box>
                        </>
                      )}
                    </Box>
                  )}
                  {hasRegistrationWindow && (
                    <Box
                      as="dl"
                      sx={{
                        mt: "0.35rem",
                        mb: 0,
                        display: "grid",
                        gridTemplateColumns: ["1fr", "1fr", "110px 1fr"],
                        columnGap: "1.35rem",
                        rowGap: "0.35rem",
                        "& dt": {
                          m: 0,
                          fontSize: "xs",
                          color: "gray",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        },
                        "& dd": {
                          m: 0,
                        },
                      }}
                    >
                      <Box as="dt">Status</Box>
                      <Box as="dd">
                        <Box
                          as="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            px: "0.6rem",
                            py: "0.18rem",
                            borderRadius: "999px",
                            bg:
                              isRegistrationOpen === true
                                ? "#e8f7ec"
                                : "#fde8e8",
                            color:
                              isRegistrationOpen === true
                                ? "#1f7a3f"
                                : "#9a1f1f",
                            fontSize: "xs",
                            fontWeight: "heading",
                          }}
                        >
                          <Box
                            as="span"
                            sx={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "999px",
                              bg:
                                isRegistrationOpen === true
                                  ? "#1f7a3f"
                                  : "#9a1f1f",
                            }}
                          />
                          {isRegistrationOpen === true ? "Open" : "Closed"}
                        </Box>
                      </Box>
                      {registrationEndLabel && (
                        <>
                          <Box as="dt">Register by</Box>
                          <Box
                            as="dd"
                            sx={{ fontSize: valueTextSize, color: "text" }}
                          >
                            {registrationEndLabel}
                          </Box>
                        </>
                      )}
                    </Box>
                  )}
                  <Flex
                    sx={{
                      mt: "0.95rem",
                      width: "100%",
                      alignItems: "stretch",
                      gap: "0.5rem",
                    }}
                  >
                    {event?.url && !shouldDisableEventMsrcLink ? (
                      <OutboundLink
                        href={event.url}
                        rel="noopener noreferrer"
                        target="_blank"
                        sx={{
                          variant: "buttons.primary",
                          flex: "1 1 auto",
                          minWidth: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textDecoration: "none",
                          fontSize: "xs",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          borderRadius: "8px",
                          px: "0.9rem",
                          py: "0.5rem",
                          whiteSpace: "nowrap",
                          boxShadow:
                            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                          transition: "background-color 0.5s ease-out",
                          "&:hover": {
                            color: "white",
                            bg: "highlight",
                          },
                        }}
                      >
                        <Flex
                          sx={{
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                        >
                          <FaGlobe size={14} aria-hidden="true" />
                          Open event in MSR
                        </Flex>
                      </OutboundLink>
                    ) : (
                      <Box
                        sx={{
                          flex: "1 1 auto",
                          minWidth: 0,
                          borderRadius: "8px",
                          border: "1px solid",
                          borderColor: "primary",
                          backgroundColor: "primary",
                          color: "white",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "xs",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          px: "0.9rem",
                          py: "0.5rem",
                          cursor: "not-allowed",
                          opacity: 0.6,
                          filter: "saturate(0.35)",
                        }}
                      >
                        Open event in MSR
                      </Box>
                    )}
                    <Box
                      ref={calendarMenuRef}
                      sx={{ position: "relative", flex: "0 0 auto" }}
                    >
                      <Box
                        as="button"
                        type="button"
                        onClick={() => setIsCalendarMenuOpen((prev) => !prev)}
                        aria-label="Add to calendar"
                        title="Add to calendar"
                        sx={{
                          ...iconActionButtonSx,
                        }}
                      >
                        <FaCalendarPlus size={16} aria-hidden="true" />
                      </Box>
                      {isCalendarMenuOpen && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "calc(100% + 6px)",
                            right: 0,
                            width: "170px",
                            border: "1px solid",
                            borderColor: "lightgray",
                            borderRadius: "10px",
                            backgroundColor: "white",
                            boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
                            overflow: "hidden",
                            zIndex: 12,
                          }}
                        >
                          {googleCalendarUrl && (
                            <OutboundLink
                              href={googleCalendarUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                              onClick={() => setIsCalendarMenuOpen(false)}
                              sx={{
                                display: "block",
                                px: "0.75rem",
                                py: "0.55rem",
                                color: "text",
                                textDecoration: "none",
                                fontSize: "xs",
                                borderBottom: "1px solid",
                                borderColor: "lightgray",
                                "&:hover": { backgroundColor: "lightgray" },
                              }}
                            >
                              Google Calendar
                            </OutboundLink>
                          )}
                          {outlookCalendarUrl && (
                            <OutboundLink
                              href={outlookCalendarUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                              onClick={() => setIsCalendarMenuOpen(false)}
                              sx={{
                                display: "block",
                                px: "0.75rem",
                                py: "0.55rem",
                                color: "text",
                                textDecoration: "none",
                                fontSize: "xs",
                                borderBottom: "1px solid",
                                borderColor: "lightgray",
                                "&:hover": { backgroundColor: "lightgray" },
                              }}
                            >
                              Outlook
                            </OutboundLink>
                          )}
                          <Box
                            as="button"
                            type="button"
                            onClick={() => {
                              handleDownloadIcs();
                              setIsCalendarMenuOpen(false);
                            }}
                            disabled={!hasCalendarData}
                            sx={{
                              width: "100%",
                              textAlign: "left",
                              px: "0.75rem",
                              py: "0.55rem",
                              border: 0,
                              bg: "transparent",
                              color: hasCalendarData ? "text" : "darkgray",
                              fontSize: "xs",
                              cursor: hasCalendarData
                                ? "pointer"
                                : "not-allowed",
                              "&:hover": {
                                backgroundColor: hasCalendarData
                                  ? "lightgray"
                                  : "transparent",
                              },
                            }}
                          >
                            iCal (.ics)
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Flex>
                </Box>
                {hasMapCoordinates && (
                  <Box
                    sx={{
                      borderTop: "1px solid",
                      borderColor: "lightgray",
                      flex: "1 1 auto",
                      minHeight: ["220px", "240px", "280px"],
                    }}
                  >
                    <PositionEventMap
                      latitude={mapLatitude}
                      longitude={mapLongitude}
                      title={event?.name}
                      token={mapboxToken}
                      showZoomControls={false}
                      height="100%"
                    />
                  </Box>
                )}
              </Card>
            ) : (
              <Card
                sx={{
                  display: ["none", "none", "block"],
                  p: 0,
                  borderRadius: "18px",
                  border: "1px solid",
                  borderColor: "lightgray",
                  flex: "1 1 auto",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    minHeight: ["220px", "260px", "320px"],
                    bg: "lightgray",
                  }}
                />
              </Card>
            )}
          </Box>
          <Box
            sx={{
              flex: ["1 1 100%", "1 1 100%", "1 1 55%"],
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <Card
              sx={{
                p: 0,
                borderRadius: "18px",
                border: "1px solid",
                borderColor: "black",
                overflow: "hidden",
                backgroundColor: "background",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "secondary",
                  px: "1.25rem",
                  py: "0.65rem",
                  color: "white",
                }}
              >
                <Text sx={{ variant: "text.label", color: "white" }}>
                  Apply
                </Text>
              </Box>
              {isMsrManagedVolunteerEvent && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    bg: "#f5d76e",
                    color: "black",
                    px: "1.25rem",
                    py: "0.7rem",
                    fontSize: "xs",
                    fontWeight: "heading",
                    lineHeight: 1.4,
                    borderBottom: "1px solid",
                    borderBottomColor: "rgba(0,0,0,0.08)",
                  }}
                >
                  <FaGlobe size={14} aria-hidden="true" />
                  <Text as="span" sx={{ color: "inherit" }}>
                    This event manages volunteer applications through MSR.
                  </Text>
                </Box>
              )}
              {isNonEventFilled && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    bg: "#dff3e6",
                    color: "#1f7a3f",
                    px: "1.25rem",
                    py: "0.7rem",
                    fontSize: "xs",
                    fontWeight: "heading",
                    lineHeight: 1.4,
                    borderBottom: "1px solid",
                    borderBottomColor: "rgba(0,0,0,0.08)",
                  }}
                >
                  <Text as="span" sx={{ color: "inherit" }}>
                    This position has been filled.
                  </Text>
                </Box>
              )}
              <Box
                sx={{
                  px: "1.25rem",
                  pt: "0.9rem",
                  pb: "1.25rem",
                }}
              >
                <Flex sx={{ flexDirection: "column", gap: "0.5rem" }}>
                  <Text sx={{ m: 0, fontSize: "sm", color: "gray" }}>
                    {hasManagedApplication
                      ? "Already applied? Manage your application."
                      : "Interested in this position? Apply here."}
                  </Text>
                  {hasManagedApplication && (
                    <Box
                      as="dl"
                      sx={{
                        mt: "0.35rem",
                        mb: "0.25rem",
                        display: "grid",
                        gridTemplateColumns: ["1fr", "1fr", "150px 1fr"],
                        columnGap: "1rem",
                        rowGap: "0.5rem",
                        "& dt": {
                          m: 0,
                          fontSize: "xs",
                          color: "gray",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        },
                        "& dd": {
                          m: 0,
                          fontSize: "sm",
                          color: "text",
                          fontWeight: "normal",
                        },
                      }}
                    >
                      <Box as="dt">Status</Box>
                      <Box as="dd">
                        <Box
                          as="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            px: "0.6rem",
                            py: "0.18rem",
                            borderRadius: "999px",
                            bg: managedApplicationStatus.bg,
                            color: managedApplicationStatus.color,
                            fontSize: "xs",
                            fontWeight: "heading",
                          }}
                        >
                          {managedApplicationStatus.label}
                        </Box>
                      </Box>
                      <Box as="dt">Submitted</Box>
                      <Box
                        as="dd"
                        sx={{
                          color: "text",
                        }}
                      >
                        {managedApplicationSubmittedLabel ? (
                          <Text
                            as="p"
                            sx={{
                              m: 0,
                              fontSize: "1rem",
                              lineHeight: "body",
                              fontWeight: "normal",
                              color: "text",
                            }}
                          >
                            {managedApplicationSubmittedLabel}
                          </Text>
                        ) : (
                          <Text
                            as="p"
                            sx={{
                              m: 0,
                              fontSize: "1rem",
                              lineHeight: "body",
                              fontWeight: "normal",
                              color: "text",
                            }}
                          >
                            Recently
                          </Text>
                        )}
                      </Box>
                    </Box>
                  )}
                  <Flex
                    sx={{ mt: "0.5rem", gap: "0.5rem", alignItems: "stretch" }}
                  >
                    <Button
                      as="button"
                      type="button"
                      onClick={() => {
                        if (shouldDisableApply) return;
                        setApplyNotice("");
                        setIsApplyModalOpen(true);
                      }}
                      disabled={shouldDisableApply}
                      sx={{
                        variant: "buttons.primary",
                        fontSize: "xs",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        borderRadius: "8px",
                        px: "0.9rem",
                        py: "0.65rem",
                        width: "100%",
                        flex: "1 1 auto",
                        minWidth: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.35rem",
                        boxShadow:
                          "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                        transition: shouldDisableApply
                          ? "none"
                          : "background-color 0.5s ease-out",
                        cursor: shouldDisableApply ? "not-allowed" : "pointer",
                        opacity: shouldDisableApply ? 0.6 : 1,
                        filter: shouldDisableApply ? "saturate(0.35)" : "none",
                        "&:disabled": {
                          color: "white",
                          bg: "primary",
                          cursor: "not-allowed",
                          opacity: 0.6,
                          filter: "saturate(0.35)",
                          pointerEvents: "none",
                        },
                        "&:disabled:hover": {
                          color: "white",
                          bg: "primary",
                        },
                        "&:hover:not(:disabled)": {
                          color: "white",
                          bg: "highlight",
                        },
                      }}
                    >
                      <FaBriefcase size={12} aria-hidden="true" />
                      {hasManagedApplication
                        ? "View / Manage application"
                        : "Apply for this position"}
                    </Button>
                    <Box
                      as="button"
                      type="button"
                      aria-label="Share this position"
                      title="Share this position"
                      onClick={handleShare}
                      sx={iconActionButtonSx}
                    >
                      <FiShare2 size={16} aria-hidden="true" />
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            </Card>
            <Card
              sx={{
                p: 0,
                borderRadius: "18px",
                border: "1px solid",
                flex: "1 1 auto",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "secondary",
                  px: "1.25rem",
                  py: "0.65rem",
                  color: "white",
                }}
              >
                <Text
                  sx={{
                    variant: "text.label",
                    color: "white",
                  }}
                >
                  Position details
                </Text>
              </Box>
              <Box
                sx={{
                  px: "1.5rem",
                  pt: "1rem",
                  pb: "1.5rem",
                }}
              >
                {positionTitle && (
                  <Text
                    as="div"
                    sx={{
                      mt: 0,
                      fontSize: "sm",
                      fontWeight: "heading",
                      color: "text",
                      mb: "0.85rem",
                    }}
                  >
                    {shortPositionTitle}
                  </Text>
                )}
                <Box
                  as="dl"
                  sx={{
                    mt: 0,
                    display: "grid",
                    gridTemplateColumns: ["1fr", "1fr", "150px 1fr"],
                    columnGap: "1rem",
                    rowGap: "0.5rem",
                    "& dt": {
                      m: 0,
                      fontSize: "xs",
                      color: "gray",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    },
                    "& dd": {
                      m: 0,
                      fontSize: valueTextSize,
                      color: "text",
                    },
                    "& dd.position-detail-longtext": {
                      fontSize: "sm",
                      lineHeight: "body",
                    },
                  }}
                >
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
                              color: "white",
                            },
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
                            gap: "0.45rem",
                            px: "0.6rem",
                            py: "0.2rem",
                            borderRadius: "999px",
                            fontSize: valueTextSize,
                            fontWeight: "heading",
                            bg: skillTone.bg,
                            color: skillTone.color,
                          }}
                        >
                          <Box
                            as="span"
                            sx={{ display: "inline-flex", lineHeight: 0 }}
                          >
                            <SkillLevelIcon size={14} aria-hidden="true" />
                          </Box>
                          {skillLevelLabel}
                        </Box>
                      </Box>
                    </>
                  )}
                  {role?.membershipRequired !== undefined &&
                    role?.membershipRequired !== null && (
                      <>
                        <Box as="dt">Membership required</Box>
                        <Box
                          as="dd"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            minHeight: "100%",
                            lineHeight: "body",
                          }}
                        >
                          {role.membershipRequired ? (
                            <Box
                              as="span"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                px: "0.65rem",
                                py: "0.14rem",
                                borderRadius: "999px",
                                bg: "#f2cf3a",
                                color: "#2b1f00",
                                fontSize: valueTextSize,
                              }}
                            >
                              <Box
                                as="span"
                                sx={{ display: "inline-flex", lineHeight: 0 }}
                              >
                                <FaIdBadge size={12} aria-hidden="true" />
                              </Box>
                              <Box as="span" sx={{ fontWeight: "heading" }}>
                                Yes
                              </Box>
                              <Box
                                as="span"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  fontSize: "0.78em",
                                  fontStyle: "italic",
                                  color: "inherit",
                                  lineHeight: 1.1,
                                }}
                              >
                                - active BMW CCA membership required
                              </Box>
                            </Box>
                          ) : (
                            <Box
                              as="span"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                px: "0.65rem",
                                py: "0.1rem",
                                borderRadius: "999px",
                                bg: "lightgray",
                                color: "text",
                                fontSize: valueTextSize,
                              }}
                            >
                              <Box
                                as="span"
                                sx={{ display: "inline-flex", lineHeight: 0 }}
                              >
                                <FaUsers size={14} aria-hidden="true" />
                              </Box>
                              <Box
                                as="span"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.2rem",
                                }}
                              >
                                <Box as="span" sx={{ fontWeight: "heading" }}>
                                  No
                                </Box>
                                <Box
                                  as="span"
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    fontSize: "0.78em",
                                    fontStyle: "italic",
                                    lineHeight: 1.1,
                                  }}
                                >
                                  - anyone can volunteer
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Box>
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
                              color: "white",
                            },
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
                            gap: "0.45rem",
                            px: "0.6rem",
                            py: "0.2rem",
                            minHeight: pointsPillMinHeight,
                            borderRadius: "999px",
                            fontSize: valueTextSize,
                            fontWeight: "heading",
                            bg: "lightgray",
                            color: "text",
                          }}
                        >
                          {(pointStars || isTenPointRole) && (
                            <Box
                              as="span"
                              sx={{
                                display: "inline-flex",
                                flexDirection: "column",
                                alignSelf: "center",
                                justifyContent: "center",
                                lineHeight: 1,
                                fontSize: "0.78em",
                                letterSpacing: "0.02em",
                              }}
                            >
                              {isTenPointRole ? (
                                <>
                                  <Box as="span">★★★★★</Box>
                                  <Box as="span">★★★★★</Box>
                                </>
                              ) : (
                                <Box as="span">{pointStars}</Box>
                              )}
                            </Box>
                          )}
                          <Box
                            as="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              alignSelf: "center",
                              lineHeight: 1.1,
                            }}
                          >
                            {pointsLabel}
                          </Box>
                        </Box>
                      </Box>
                    </>
                  )}
                  {hasDuration && (
                    <>
                      <Box as="dt">Duration</Box>
                      <Box as="dd">
                        <Box
                          as="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            px: "0.6rem",
                            py: "0.2rem",
                            borderRadius: "999px",
                            fontSize: valueTextSize,
                            fontWeight: "heading",
                            bg: "lightgray",
                            color: "text",
                          }}
                        >
                          <Box
                            as="span"
                            sx={{ display: "inline-flex", lineHeight: 0 }}
                          >
                            <FaClock size={12} aria-hidden="true" />
                          </Box>
                          <Box as="span">{durationLabel}</Box>
                        </Box>
                      </Box>
                    </>
                  )}
                  {role?.compensation && (
                    <>
                      <Box as="dt">Compensation</Box>
                      <Box as="dd">{role.compensation}</Box>
                    </>
                  )}
                  {roleDescription && (
                    <>
                      <Box as="dt" sx={{ gridColumn: "1 / -1", mt: "0.35rem" }}>
                        Description
                      </Box>
                      <Box
                        as="dd"
                        className="position-detail-longtext"
                        sx={{
                          gridColumn: "1 / -1",
                          backgroundColor: "#fff6d9",
                          borderRadius: "6px",
                          px: "0.65rem",
                          py: "0.55rem",
                        }}
                      >
                        {roleDescription}
                      </Box>
                    </>
                  )}
                  {roleDetail && (
                    <>
                      <Box as="dt" sx={{ gridColumn: "1 / -1", mt: "0.35rem" }}>
                        Details
                      </Box>
                      <Box
                        as="dd"
                        className="position-detail-longtext"
                        sx={{
                          gridColumn: "1 / -1",
                          backgroundColor: "#fff6d9",
                          borderRadius: "6px",
                          px: "0.65rem",
                          py: "0.55rem",
                        }}
                      >
                        {roleDetail}
                      </Box>
                    </>
                  )}
                </Box>
                {role?.descriptionPdf?.asset?.url && (
                  <Box sx={{ mt: "1.5rem" }}>
                    <Text sx={{ variant: "text.label", color: "darkgray" }}>
                      Position PDF
                    </Text>
                    <Box
                      as="iframe"
                      title="Volunteer position PDF"
                      src={role.descriptionPdf.asset.url}
                      sx={{
                        width: "100%",
                        height: ["260px", "320px", "360px"],
                        border: "1px solid",
                        borderColor: "lightgray",
                        borderRadius: "12px",
                        mt: "0.75rem",
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
                        fontSize: "sm",
                      }}
                    >
                      Open PDF in new tab →
                    </OutboundLink>
                  </Box>
                )}
              </Box>
            </Card>
          </Box>
        </Flex>
      </ContentContainer>
      {isApplyModalOpen && (
        <Box
          role="dialog"
          aria-modal="true"
          aria-label={`Apply for ${positionTitle}`}
          onClick={() => {
            if (isWithdrawProcessing) return;
            handleCloseApplyModal();
          }}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 12000,
            bg: "rgba(38, 42, 48, 0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: ["0", "0", "1.5rem"],
            overflowY: "auto",
          }}
        >
          <Card
            onClick={(event) => event.stopPropagation()}
            sx={{
              width: ["100%", "100%", "min(720px, 92vw)"],
              height: ["100vh", "100vh", "auto"],
              maxHeight: ["100vh", "100vh", "92vh"],
              borderRadius: ["0", "0", "18px"],
              border: ["0", "0", "1px solid"],
              borderColor: "black",
              overflow: "hidden",
              backgroundColor: "background",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                backgroundColor: "secondary",
                color: "white",
                px: ["1.2rem", "1.3rem", "1.45rem"],
                py: ["0.85rem", "0.95rem", "1.05rem"],
                pr: "4.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
              }}
            >
              <Box
                as="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "66px",
                  height: "66px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(255,255,255,0.18)",
                  border: "1px solid",
                  borderColor: "rgba(255,255,255,0.42)",
                  lineHeight: 0,
                  flexShrink: 0,
                }}
              >
                <PositionRoleIcon size={40} aria-hidden="true" />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  flex: "1 1 auto",
                }}
              >
                <Heading
                  as="h1"
                  sx={{
                    variant: "styles.h1",
                    color: "white",
                    m: 0,
                  }}
                >
                  Apply
                </Heading>
                <Box
                  sx={{
                    mt: "0.45rem",
                    mb: "0.45rem",
                    borderTop: "1px solid",
                    borderTopColor: "rgba(255,255,255,0.35)",
                  }}
                />
                <Heading
                  as="h2"
                  sx={{
                    variant: "styles.h3",
                    color: "white",
                    m: 0,
                    fontWeight: "normal",
                    minWidth: 0,
                    overflowWrap: "anywhere",
                  }}
                >
                  {positionTitle}
                </Heading>
              </Box>
            </Box>
            <Box
              as="button"
              type="button"
              aria-label="Close application modal"
              onClick={handleCloseApplyModal}
              disabled={isWithdrawProcessing}
              sx={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "48px",
                height: "48px",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: "rgba(0,0,0,0.18)",
                backgroundColor: "rgba(255,255,255,0.98)",
                color: "text",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
                "&:hover": {
                  backgroundColor: "white",
                  color: "primary",
                },
              }}
            >
              <FiX size={24} aria-hidden="true" />
            </Box>
            <Box
              sx={{
                px: ["1.15rem", "1.25rem", "1.45rem"],
                py: ["0.8rem", "0.9rem", "0.95rem"],
                bg: "#efefef",
                borderTop: "1px solid",
                borderTopColor: "#d5d5d5",
                borderBottom: "1px solid",
                borderBottomColor: "#d5d5d5",
              }}
            >
              <Text sx={{ fontSize: "sm", color: "text", m: 0 }}>
                You will receive an email confirmation upon submission and when
                we have made a decision on your application. Thank you for
                applying!
              </Text>
            </Box>
            {pointsLabel && showPointsBanner && (
              <Box
                sx={{
                  px: ["0.9rem", "1rem", "1.25rem"],
                  py: "0.65rem",
                  bg: "#e8f7ec",
                  borderTop: "1px solid",
                  borderTopColor: "#d6eadb",
                  borderBottom: "1px solid",
                  borderBottomColor: "#d6eadb",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.55rem",
                  position: "relative",
                }}
              >
                <Box
                  as="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1f7a3f",
                    flexShrink: 0,
                  }}
                >
                  <FaAward size={22} aria-hidden="true" />
                </Box>
                <Text sx={{ fontSize: "sm", color: "text", m: 0 }}>
                  This role earns {pointsLabel} in our{" "}
                  <Link
                    to="/volunteer/rewards"
                    sx={{
                      color: "#1f7a3f",
                      fontWeight: "heading",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    volunteer reward program
                  </Link>
                  !
                </Text>
                <Box
                  as="button"
                  type="button"
                  aria-label="Dismiss points banner"
                  onClick={dismissPointsBanner}
                  sx={{
                    position: "absolute",
                    top: "6px",
                    right: "8px",
                    border: 0,
                    bg: "transparent",
                    color: "#1f7a3f",
                    width: "24px",
                    height: "24px",
                    borderRadius: "999px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    "&:hover": {
                      bg: "rgba(31,122,63,0.14)",
                    },
                  }}
                >
                  <FiX size={16} aria-hidden="true" />
                </Box>
              </Box>
            )}
            <Box
              as="form"
              onSubmit={handleApplySubmit}
              sx={{
                p: ["1rem", "1.25rem", "1.5rem"],
                overflowY: "auto",
                position: "relative",
              }}
            >
              {isManagedApplicationRejected && (
                <Alert
                  sx={{
                    mx: ["-1rem", "-1.25rem", "-1.5rem"],
                    mt: ["-1rem", "-1.25rem", "-1.5rem"],
                    p: "0.75rem 1rem",
                    mb: "0.9rem",
                    borderTop: "1px solid",
                    borderTopColor: "#f5b7b1",
                    borderBottom: "1px solid",
                    borderBottomColor: "#f5b7b1",
                    bg: "#fde8e8",
                    color: "#9a1f1f",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                  }}
                >
                  <FaBan size={18} aria-hidden="true" />
                  <Text sx={{ m: 0, fontSize: "sm", color: "inherit" }}>
                    <Box as="span" sx={{ fontWeight: "heading" }}>
                      Application rejected.
                    </Box>{" "}
                    <Box as="span" sx={{ fontWeight: 400 }}>
                      Reason provided: {managedRejectedReasonPublic || "NA"}
                    </Box>
                  </Text>
                </Alert>
              )}
              {isManagedApplicationAssigned && (
                <Alert
                  sx={{
                    mx: ["-1rem", "-1.25rem", "-1.5rem"],
                    mt: ["-1rem", "-1.25rem", "-1.5rem"],
                    p: "0.75rem 1rem",
                    mb: "0.9rem",
                    borderTop: "1px solid",
                    borderTopColor: "#c4e8d0",
                    borderBottom: "1px solid",
                    borderBottomColor: "#c4e8d0",
                    bg: "#e8f7ec",
                    color: "#1f7a3f",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                  }}
                >
                  <FaCheckCircle size={20} aria-hidden="true" />
                  <Text sx={{ m: 0, fontSize: "sm", color: "inherit" }}>
                    Great news. You have been assigned to this role. Your
                    application is now read-only.
                  </Text>
                </Alert>
              )}
              <Box
                as="fieldset"
                disabled={isApplyFormReadOnly}
                sx={{
                  border: 0,
                  p: 0,
                  m: 0,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: ["1fr", "1fr 1fr"],
                    gap: "0.9rem",
                    mb: "0.9rem",
                  }}
                >
                  <Box>
                    <Text
                      as="label"
                      htmlFor="volunteer-apply-first-name"
                      sx={{
                        variant: "text.label",
                        color: "text",
                        m: 0,
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      First name{" "}
                      <Box as="span" sx={{ color: "#c62828", fontWeight: 700 }}>
                        *
                      </Box>
                    </Text>
                    <Box sx={{ position: "relative" }}>
                      <Box
                        as="input"
                        id="volunteer-apply-first-name"
                        type="text"
                        required
                        value={applyFormData.firstName}
                        onChange={handleApplyFieldChange("firstName")}
                        sx={{
                          mt: "0.35rem",
                          width: "100%",
                          border: "1px solid",
                          borderColor: "lightgray",
                          borderRadius: "8px",
                          px: "0.7rem",
                          pr: "2.3rem",
                          py: "0.55rem",
                          fontSize: "sm",
                        }}
                      />
                      {Boolean(applyFormData.firstName.trim()) && (
                        <Box
                          as="span"
                          sx={{
                            ...REQUIRED_FIELD_CHECK_SX,
                            position: "absolute",
                            right: "0.65rem",
                            top: "50%",
                            transform: "translateY(-33%)",
                            ml: 0,
                            pointerEvents: "none",
                          }}
                        >
                          <FaCheckCircle size={20} aria-hidden="true" />
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <Text
                      as="label"
                      htmlFor="volunteer-apply-last-name"
                      sx={{
                        variant: "text.label",
                        color: "text",
                        m: 0,
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      Last name{" "}
                      <Box as="span" sx={{ color: "#c62828", fontWeight: 700 }}>
                        *
                      </Box>
                    </Text>
                    <Box sx={{ position: "relative" }}>
                      <Box
                        as="input"
                        id="volunteer-apply-last-name"
                        type="text"
                        required
                        value={applyFormData.lastName}
                        onChange={handleApplyFieldChange("lastName")}
                        sx={{
                          mt: "0.35rem",
                          width: "100%",
                          border: "1px solid",
                          borderColor: "lightgray",
                          borderRadius: "8px",
                          px: "0.7rem",
                          pr: "2.3rem",
                          py: "0.55rem",
                          fontSize: "sm",
                        }}
                      />
                      {Boolean(applyFormData.lastName.trim()) && (
                        <Box
                          as="span"
                          sx={{
                            ...REQUIRED_FIELD_CHECK_SX,
                            position: "absolute",
                            right: "0.65rem",
                            top: "50%",
                            transform: "translateY(-33%)",
                            ml: 0,
                            pointerEvents: "none",
                          }}
                        >
                          <FaCheckCircle size={20} aria-hidden="true" />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ mb: "0.9rem" }}>
                  <Text
                    as="label"
                    htmlFor="volunteer-apply-email"
                    sx={{
                      variant: "text.label",
                      color: "text",
                      m: 0,
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    Email{" "}
                    <Box as="span" sx={{ color: "#c62828", fontWeight: 700 }}>
                      *
                    </Box>
                  </Text>
                  <Box sx={{ position: "relative" }}>
                    <Box
                      as="input"
                      id="volunteer-apply-email"
                      type="email"
                      required
                      value={applyFormData.email}
                      onChange={handleApplyFieldChange("email")}
                      sx={{
                        mt: "0.35rem",
                        width: "100%",
                        border: "1px solid",
                        borderColor: "lightgray",
                        borderRadius: "8px",
                        px: "0.7rem",
                        pr: "2.3rem",
                        py: "0.55rem",
                        fontSize: "sm",
                      }}
                    />
                    {isApplyEmailValid && (
                      <Box
                        as="span"
                        sx={{
                          ...REQUIRED_FIELD_CHECK_SX,
                          position: "absolute",
                          right: "0.65rem",
                          top: "50%",
                          transform: "translateY(-33%)",
                          ml: 0,
                          pointerEvents: "none",
                        }}
                      >
                        <FaCheckCircle size={20} aria-hidden="true" />
                      </Box>
                    )}
                  </Box>
                  {Boolean(applyFormData.email.trim()) &&
                    !isApplyEmailValid && (
                      <Text
                        sx={{ mt: "0.3rem", fontSize: "xs", color: "#9e2a2b" }}
                      >
                        Enter a valid email address.
                      </Text>
                    )}
                </Box>
                <Box sx={{ mb: "0.9rem" }}>
                  <Text
                    as="label"
                    htmlFor="volunteer-apply-phone"
                    sx={{
                      variant: "text.label",
                      color: "text",
                      m: 0,
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    Phone number
                  </Text>
                  <Box
                    as="input"
                    id="volunteer-apply-phone"
                    type="tel"
                    value={applyFormData.phone}
                    onChange={handleApplyFieldChange("phone")}
                    sx={{
                      mt: "0.35rem",
                      width: "100%",
                      border: "1px solid",
                      borderColor: "lightgray",
                      borderRadius: "8px",
                      px: "0.7rem",
                      py: "0.55rem",
                      fontSize: "sm",
                    }}
                  />
                </Box>
                <Box sx={{ mb: "0.9rem" }}>
                  <Text
                    as="p"
                    sx={{ variant: "text.label", color: "text", m: 0 }}
                  >
                    Have you performed this role before?{" "}
                    <Box as="span" sx={{ color: "#c62828", fontWeight: 700 }}>
                      *
                    </Box>
                  </Text>
                  <Flex sx={{ gap: "1rem", mt: "0.5rem", flexWrap: "wrap" }}>
                    <Box
                      as="label"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        px: "0.7rem",
                        py: "0.45rem",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor:
                          applyFormData.hasPerformedRoleBefore === true
                            ? "primary"
                            : "lightgray",
                        backgroundColor:
                          applyFormData.hasPerformedRoleBefore === true
                            ? "#eaf3ff"
                            : "white",
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        as="input"
                        type="checkbox"
                        checked={applyFormData.hasPerformedRoleBefore === true}
                        onChange={handleApplyPerformedRoleBeforeChange(true)}
                        sx={{
                          width: "23px",
                          height: "23px",
                          margin: 0,
                          accentColor: "#1f6fe5",
                          cursor: "pointer",
                        }}
                      />
                      <Text sx={{ fontSize: "sm", color: "text" }}>Yes</Text>
                    </Box>
                    <Box
                      as="label"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        px: "0.7rem",
                        py: "0.45rem",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor:
                          applyFormData.hasPerformedRoleBefore === false
                            ? "primary"
                            : "lightgray",
                        backgroundColor:
                          applyFormData.hasPerformedRoleBefore === false
                            ? "#eaf3ff"
                            : "white",
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        as="input"
                        type="checkbox"
                        checked={applyFormData.hasPerformedRoleBefore === false}
                        onChange={handleApplyPerformedRoleBeforeChange(false)}
                        sx={{
                          width: "23px",
                          height: "23px",
                          margin: 0,
                          accentColor: "#1f6fe5",
                          cursor: "pointer",
                        }}
                      />
                      <Text sx={{ fontSize: "sm", color: "text" }}>No</Text>
                    </Box>
                  </Flex>
                </Box>
                <Box sx={{ mb: "0.9rem" }}>
                  <Text
                    as="label"
                    htmlFor="volunteer-apply-referral"
                    sx={{ variant: "text.label", color: "text", m: 0 }}
                  >
                    Referral (optional)
                  </Text>
                  <Box
                    as="input"
                    id="volunteer-apply-referral"
                    type="text"
                    value={applyFormData.referral}
                    onChange={handleApplyFieldChange("referral")}
                    sx={{
                      mt: "0.35rem",
                      width: "100%",
                      border: "1px solid",
                      borderColor: "lightgray",
                      borderRadius: "8px",
                      px: "0.7rem",
                      py: "0.55rem",
                      fontSize: "sm",
                    }}
                  />
                </Box>
                <Box sx={{ mb: "0.9rem" }}>
                  <Text
                    as="label"
                    htmlFor="volunteer-apply-notes"
                    sx={{ variant: "text.label", color: "text", m: 0 }}
                  >
                    Notes (optional)
                  </Text>
                  <Box
                    as="textarea"
                    id="volunteer-apply-notes"
                    rows={4}
                    value={applyFormData.notes}
                    onChange={handleApplyFieldChange("notes")}
                    sx={{
                      mt: "0.35rem",
                      width: "100%",
                      border: "1px solid",
                      borderColor: "lightgray",
                      borderRadius: "8px",
                      px: "0.7rem",
                      py: "0.55rem",
                      fontSize: "sm",
                      resize: "vertical",
                    }}
                  />
                </Box>
                {applyNotice && !isApplySuccessState && (
                  <Text
                    sx={{
                      fontSize: "xs",
                      color:
                        applyNoticeTone === "error"
                          ? "#9e2a2b"
                          : applyNoticeTone === "success"
                          ? "#1f7a3f"
                          : "darkgray",
                      mb: "0.9rem",
                    }}
                  >
                    {applyNotice}
                  </Text>
                )}
              </Box>
              <Box
                sx={{
                  mt: "0.55rem",
                  display: "grid",
                  gridTemplateColumns: [
                    "1fr",
                    "minmax(0, 1fr) auto",
                    "minmax(0, 1fr) auto",
                  ],
                  alignItems: "end",
                  columnGap: "0.75rem",
                  rowGap: "0.65rem",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Text
                    sx={{
                      mt: 0,
                      fontSize: "12px",
                      color: "darkgray",
                      textAlign: "left",
                      lineHeight: 1.45,
                    }}
                  >
                    Fields marked{" "}
                    <Box as="span" sx={{ color: "#c62828", fontWeight: 700 }}>
                      *
                    </Box>{" "}
                    are required.{" "}
                  </Text>
                  <Text
                    sx={{
                      mt: "0.35rem",
                      fontSize: "12px",
                      color: "darkgray",
                      textAlign: "left",
                      lineHeight: 1.45,
                    }}
                  >
                    All positions and role assignments are subject to change.
                    Certain roles require board approval.
                  </Text>
                </Box>
                <Flex
                  sx={{
                    justifyContent: "flex-end",
                    gap: "0.6rem",
                    flexWrap: "wrap",
                  }}
                >
                  {isWithdrawnState && (
                    <Button
                      as="button"
                      type="button"
                      onClick={() => setShowResetApplicationConfirm(true)}
                      disabled={isWithdrawProcessing}
                      sx={{
                        bg: "#f3d6d6",
                        color: "#9a1f1f",
                        borderRadius: "8px",
                        px: "1rem",
                        py: "0.55rem",
                        fontSize: "sm",
                        border: "1px solid",
                        borderColor: "#e8b8b8",
                        "&:hover": {
                          bg: "#ecc4c4",
                          color: "#9a1f1f",
                        },
                      }}
                    >
                      Reset application
                    </Button>
                  )}
                  <Button
                    as="button"
                    type="button"
                    onClick={handleCloseApplyModal}
                    disabled={isWithdrawProcessing}
                    sx={{
                      bg: "lightgray",
                      color: "text",
                      borderRadius: "8px",
                      px: "1rem",
                      py: "0.55rem",
                      fontSize: "sm",
                      "&:hover": {
                        bg: "#d8d8d8",
                        color: "text",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  {!isManagedApplicationRejected && (
                    <Button
                      as="button"
                      type="submit"
                      disabled={!canSubmitApplyForm}
                      sx={{
                        variant: "buttons.primary",
                        borderRadius: "8px",
                        px: "1rem",
                        py: "0.55rem",
                        fontSize: "sm",
                        cursor: canSubmitApplyForm ? "pointer" : "not-allowed",
                        opacity: canSubmitApplyForm ? 1 : 0.55,
                        "&:disabled": {
                          opacity: 0.55,
                          cursor: "not-allowed",
                          pointerEvents: "none",
                        },
                        "&:disabled:hover": {
                          bg: "primary",
                          color: "white",
                          boxShadow: "none",
                          transform: "none",
                        },
                      }}
                    >
                      {isApplySubmitting && !isWithdrawProcessing
                        ? "Submitting..."
                        : shouldShowUpdateLabel
                        ? "Update"
                        : "Submit"}
                    </Button>
                  )}
                  {canWithdrawManagedApplication && !isApplySuccessState && (
                    <Button
                      as="button"
                      type="button"
                      disabled={isApplySubmitting || isApplySuccessState}
                      onClick={() => setShowWithdrawConfirm(true)}
                      sx={{
                        bg: "#b42318",
                        color: "white",
                        borderRadius: "8px",
                        px: "1rem",
                        py: "0.55rem",
                        fontSize: "sm",
                        cursor:
                          !isApplySubmitting && !isApplySuccessState
                            ? "pointer"
                            : "not-allowed",
                        opacity:
                          !isApplySubmitting && !isApplySuccessState ? 1 : 0.55,
                        "&:hover": {
                          bg: "#991b1b",
                          color: "white",
                        },
                        "&:disabled": {
                          opacity: 0.55,
                          cursor: "not-allowed",
                          pointerEvents: "none",
                        },
                      }}
                    >
                      Withdraw
                    </Button>
                  )}
                </Flex>
              </Box>
              {isApplySuccessState && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bg: "rgba(46, 52, 58, 0.32)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: "1rem",
                    zIndex: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "460px",
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: "#c4e8d0",
                      bg: "#e8f7ec",
                      color: "#1f7a3f",
                      p: "1rem 1.15rem",
                      textAlign: "center",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: "0.5rem",
                      }}
                    >
                      <FaCheckCircle size={56} aria-hidden="true" />
                    </Box>
                    <Text
                      sx={{
                        fontSize: "sm",
                        fontWeight: "semibold",
                        color: "#1f7a3f",
                        m: 0,
                      }}
                    >
                      {applyNotice || "Application submitted successfully."}
                    </Text>
                    <Text
                      sx={{
                        mt: "0.4rem",
                        mb: 0,
                        fontSize: "xs",
                        color: "#1f7a3f",
                        opacity: 0.95,
                        lineHeight: 1.45,
                      }}
                    >
                      If you do not receive a confirmation email within a few
                      minutes, please check your spam or junk folder.
                    </Text>
                    <Button
                      as="button"
                      type="button"
                      onClick={handleCloseApplyModal}
                      sx={{
                        mt: "0.75rem",
                        bg: "#1f7a3f",
                        color: "white",
                        borderRadius: "8px",
                        px: "0.95rem",
                        py: "0.45rem",
                        fontSize: "sm",
                        "&:hover": {
                          bg: "#176334",
                          color: "white",
                        },
                      }}
                    >
                      Close
                    </Button>
                  </Box>
                </Box>
              )}
              {showWithdrawConfirm && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bg: "rgba(46, 52, 58, 0.42)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: "1rem",
                    zIndex: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "460px",
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: "#f5b7b1",
                      bg: "#fde8e8",
                      color: "#9a1f1f",
                      p: "1rem 1.15rem",
                      textAlign: "center",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                    }}
                  >
                    <Text
                      sx={{
                        fontSize: "sm",
                        fontWeight: "semibold",
                        color: "#9a1f1f",
                        m: 0,
                      }}
                    >
                      Are you sure you want to withdraw this application?
                    </Text>
                    <Flex
                      sx={{
                        mt: "0.85rem",
                        justifyContent: "center",
                        gap: "0.55rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        as="button"
                        type="button"
                        onClick={() => setShowWithdrawConfirm(false)}
                        sx={{
                          bg: "white",
                          color: "text",
                          borderRadius: "8px",
                          px: "0.95rem",
                          py: "0.45rem",
                          fontSize: "sm",
                          border: "1px solid",
                          borderColor: "#d6d6d6",
                          "&:hover": {
                            bg: "#f3f3f3",
                            color: "text",
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        as="button"
                        type="button"
                        onClick={handleWithdrawApplication}
                        sx={{
                          bg: "#b42318",
                          color: "white",
                          borderRadius: "8px",
                          px: "0.95rem",
                          py: "0.45rem",
                          fontSize: "sm",
                          "&:hover": {
                            bg: "#991b1b",
                            color: "white",
                          },
                        }}
                      >
                        Withdraw
                      </Button>
                    </Flex>
                  </Box>
                </Box>
              )}
              {showResetApplicationConfirm && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bg: "rgba(46, 52, 58, 0.42)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: "1rem",
                    zIndex: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "460px",
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: "#f5b7b1",
                      bg: "#fde8e8",
                      color: "#9a1f1f",
                      p: "1rem 1.15rem",
                      textAlign: "center",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                    }}
                  >
                    <Text
                      sx={{
                        fontSize: "sm",
                        fontWeight: "semibold",
                        color: "#9a1f1f",
                        m: 0,
                      }}
                    >
                      Reset application?
                    </Text>
                    <Text
                      sx={{
                        mt: "0.45rem",
                        mb: 0,
                        fontSize: "xs",
                        color: "#9a1f1f",
                      }}
                    >
                      This will clear your saved application and start fresh.
                    </Text>
                    <Flex
                      sx={{
                        mt: "0.85rem",
                        justifyContent: "center",
                        gap: "0.55rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        as="button"
                        type="button"
                        onClick={() => setShowResetApplicationConfirm(false)}
                        sx={{
                          bg: "white",
                          color: "text",
                          borderRadius: "8px",
                          px: "0.95rem",
                          py: "0.45rem",
                          fontSize: "sm",
                          border: "1px solid",
                          borderColor: "#d6d6d6",
                          "&:hover": {
                            bg: "#f3f3f3",
                            color: "text",
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        as="button"
                        type="button"
                        onClick={handleResetManagedApplication}
                        sx={{
                          bg: "#b42318",
                          color: "white",
                          borderRadius: "8px",
                          px: "0.95rem",
                          py: "0.45rem",
                          fontSize: "sm",
                          "&:hover": {
                            bg: "#991b1b",
                            color: "white",
                          },
                        }}
                      >
                        Yes
                      </Button>
                    </Flex>
                  </Box>
                </Box>
              )}
              {isWithdrawProcessing && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bg: "rgba(46, 52, 58, 0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: "1rem",
                    zIndex: 4,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "360px",
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: "#f0c9c5",
                      bg: "#ffffff",
                      color: "text",
                      p: "1rem 1.1rem",
                      textAlign: "center",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.85rem",
                    }}
                  >
                    <Box
                      as="span"
                      sx={{
                        display: "inline-block",
                        width: "34px",
                        height: "34px",
                        borderRadius: "999px",
                        border: "3px solid",
                        borderColor: "#e6e6e6",
                        borderTopColor: "#b42318",
                        animation: "withdrawSpin 0.8s linear infinite",
                        "@keyframes withdrawSpin": {
                          from: { transform: "rotate(0deg)" },
                          to: { transform: "rotate(360deg)" },
                        },
                      }}
                    />
                    <Text sx={{ m: 0, fontSize: "sm" }}>
                      {isResetProcessing
                        ? "Resetting application..."
                        : "Withdrawing application..."}
                    </Text>
                  </Box>
                </Box>
              )}
              {isApplySubmitting && !isWithdrawProcessing && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bg: "rgba(46, 52, 58, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: "1rem",
                    zIndex: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "360px",
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: "#cfd8e8",
                      bg: "#ffffff",
                      color: "text",
                      p: "1rem 1.1rem",
                      textAlign: "center",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.85rem",
                    }}
                  >
                    <Box
                      as="span"
                      sx={{
                        display: "inline-block",
                        width: "34px",
                        height: "34px",
                        borderRadius: "999px",
                        border: "3px solid",
                        borderColor: "#e6e6e6",
                        borderTopColor: "primary",
                        animation: "submitSpin 0.8s linear infinite",
                        "@keyframes submitSpin": {
                          from: { transform: "rotate(0deg)" },
                          to: { transform: "rotate(360deg)" },
                        },
                      }}
                    />
                    <Text sx={{ m: 0, fontSize: "sm" }}>
                      {hasManagedApplication
                        ? "Updating application..."
                        : "Submitting application..."}
                    </Text>
                  </Box>
                </Box>
              )}
            </Box>
          </Card>
        </Box>
      )}
      {toastMessage && (
        <Box
          key={toastKey}
          sx={{
            position: "fixed",
            top: ["12px", "16px", "20px"],
            right: ["12px", "16px", "20px"],
            zIndex: 13000,
            bg: "rgba(255,255,255,0.96)",
            color: "#0f172a",
            pl: "1.1rem",
            pr: "0.75rem",
            py: "0.85rem",
            borderRadius: "8px",
            boxShadow: "0 16px 34px rgba(15, 23, 42, 0.18)",
            fontSize: "sm",
            fontWeight: 500,
            letterSpacing: "0.01em",
            minWidth: ["320px", "390px"],
            maxWidth: "520px",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "rgba(16, 24, 40, 0.1)",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "start",
            gap: "0.45rem",
            backdropFilter: "blur(6px)",
          }}
        >
          <Text
            sx={{
              m: 0,
              fontSize: "sm",
              fontWeight: "normal",
              color: "#0f172a",
              pr: "0.25rem",
            }}
          >
            {toastMessage}
          </Text>
          <Box
            as="button"
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToastMessage("")}
            sx={{
              border: 0,
              bg: "transparent",
              color: "rgba(15, 23, 42, 0.68)",
              width: "24px",
              height: "24px",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              lineHeight: 1,
              fontSize: "16px",
              "&:hover": {
                bg: "rgba(15, 23, 42, 0.09)",
                color: "#0f172a",
              },
            }}
          >
            <FiX aria-hidden="true" />
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              height: "3px",
              bg: "rgba(16, 185, 129, 0.22)",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bg: "#10b981",
                transformOrigin: "left center",
                animation: "toastProgress 2.6s linear forwards",
                "@keyframes toastProgress": {
                  from: { transform: "scaleX(1)" },
                  to: { transform: "scaleX(0)" },
                },
              }}
            />
          </Box>
        </Box>
      )}
      {showOtherRoles && (
        <Box
          sx={{
            backgroundColor: "lightgray",
            py: ["2rem", "2.5rem", "3rem"],
            mt: ["2rem", "2.5rem", "3rem"],
          }}
        >
          <ContentContainer
            sx={{
              pl: ["16px", "16px", "50px", "100px"],
              pr: ["16px", "16px", "50px", "100px"],
              pb: ["2rem", "2.5rem", "3rem"],
            }}
          >
            <Heading sx={{ variant: "styles.h3", mb: "1.25rem" }}>
              More Volunteer Positions
            </Heading>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: ["1fr", "repeat(2, minmax(0, 1fr))"],
                gap: "1.5rem",
              }}
            >
              {activeOtherRoles.map((otherRole) => {
                const otherPositionTitle = getPositionTitle(otherRole);
                const otherCardTitle =
                  formatCardPositionTitle(otherPositionTitle) ||
                  otherPositionTitle;
                const otherDate =
                  otherRole?.motorsportRegEvent?.start || otherRole?.date;
                const otherDateLabel = otherDate ? formatDate(otherDate) : null;
                const otherImage = normalizeImageUrl(
                  otherRole?.motorsportRegEvent?.imageUrl
                );
                const OtherRoleIcon = getVolunteerRoleIconComponent(
                  otherRole?.role?.icon
                );
                const otherRolePresentationColor =
                  getVolunteerRolePresentationColor(otherRole?.role?.color);
                const otherHasAssignedEvent = Boolean(
                  otherRole?.motorsportRegEvent &&
                    (otherRole?.motorsportRegEvent?.eventId ||
                      otherRole?.motorsportRegEvent?.name ||
                      otherRole?.motorsportRegEvent?.start ||
                      otherRole?.motorsportRegEvent?.venueName ||
                      otherRole?.motorsportRegEvent?.venueCity ||
                      otherRole?.motorsportRegEvent?.venueRegion)
                );
                const otherVenueLine = [
                  otherRole?.motorsportRegEvent?.venueName,
                  otherRole?.motorsportRegEvent?.venueCity,
                  otherRole?.motorsportRegEvent?.venueRegion,
                ]
                  .filter(Boolean)
                  .join(", ");
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
                    }}
                  >
                    {otherImage && (
                      <Box
                        as="img"
                        src={otherImage}
                        alt={otherPositionTitle}
                        {...nonDraggableImageProps}
                        sx={{
                          width: "100%",
                          height: "180px",
                          objectFit: "cover",
                          display: "block",
                          ...nonDraggableImageSx,
                        }}
                      />
                    )}
                    {!otherImage && (
                      <Flex
                        sx={{
                          width: "100%",
                          height: "180px",
                          bg: otherRolePresentationColor || undefined,
                          color: "white",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {OtherRoleIcon && (
                          <OtherRoleIcon size={108} aria-hidden="true" />
                        )}
                      </Flex>
                    )}
                    <Box sx={{ px: "1rem", pt: "0.65rem", pb: "1rem" }}>
                      <Heading as="h3" sx={{ variant: "styles.h4", mt: 0 }}>
                        {otherCardTitle}
                      </Heading>
                      {otherDateLabel && (
                        <Text
                          as="div"
                          sx={{
                            fontSize: "xs",
                            color: "darkgray",
                            mt: "0.35rem",
                          }}
                        >
                          {otherDateLabel}
                        </Text>
                      )}
                      {!otherHasAssignedEvent &&
                        otherRole?.membershipRequired === true && (
                          <Text
                            as="div"
                            sx={{
                              fontSize: "xs",
                              color: "darkgray",
                              mt: "0.35rem",
                            }}
                          >
                            Active BMW CCA membership required
                          </Text>
                        )}
                      {!otherHasAssignedEvent && otherVenueLine && (
                        <Text
                          as="div"
                          sx={{
                            fontSize: "xs",
                            color: "darkgray",
                            mt: "0.35rem",
                          }}
                        >
                          {otherVenueLine}
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
