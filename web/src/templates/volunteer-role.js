/** @jsxImportSource theme-ui */
import React from "react";
import { graphql, Link } from "gatsby";
import { Box, Card, Flex, Heading, Text } from "@theme-ui/components";
import ReactMapGL, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { format, parseISO } from "date-fns";
import GraphQLErrorList from "../components/graphql-error-list";
import Seo from "../components/seo";
import Layout from "../containers/layout";
import ContentContainer from "../components/content-container";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import { BoxIcon } from "../components/box-icons";
import { FiHelpCircle, FiMaximize2, FiShare2, FiX } from "react-icons/fi";
import {
  FaBullhorn,
  FaCalendarPlus,
  FaCamera,
  FaCarSide,
  FaClock,
  FaAward,
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
import { getVolunteerRoleUrl, mapEdgesToNodes } from "../lib/helpers";
import { Client } from "../services/FetchClient";
import {
  nonDraggableImageProps,
  nonDraggableImageSx,
} from "../lib/nonDraggableImage";
import { getVolunteerPointCapColor } from "../lib/volunteerPointStyles";

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

const parseCalendarDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const toGoogleCalendarStamp = (value) =>
  value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

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

const DEFAULT_MAPBOX_PUBLIC_TOKEN =
  "pk.eyJ1IjoiZWJveDg2IiwiYSI6ImNpajViaWg4ODAwNWp0aG0zOHlxNjh3ZzcifQ.OxQI3tKViy-IIIOrLABCPQ";
const VOLUNTEER_POSITION_MAP_STYLE = "mapbox://styles/ebox86/cmlx98cji000q01qqbnvk3al6";
const VOLUNTEER_POSITION_MAP_FALLBACK_STYLE = "mapbox://styles/mapbox/light-v11";

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
    if (!isExpanded || typeof document === "undefined") return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsExpanded(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
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
            sx={{ display: "inline-flex", lineHeight: 0, pointerEvents: "none" }}
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
      limit: 2
    ) {
      edges {
        node {
          id
          role {
            name
            pointValue
          }
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
  const sanity = React.useMemo(() => new Client(), []);
  const [resolvedRole, setResolvedRole] = React.useState(role?.role || null);
  const [resolvedEventCoordinates, setResolvedEventCoordinates] =
    React.useState(null);
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = React.useState(false);
  const calendarMenuRef = React.useRef(null);
  const roleSlug = role?.slug?.current;

  React.useEffect(() => {
    setResolvedRole(role?.role || null);
  }, [role?.role]);

  React.useEffect(() => {
    setResolvedEventCoordinates(null);
    setIsCalendarMenuOpen(false);
  }, [roleSlug]);

  React.useEffect(() => {
    if (!roleSlug) return;
    let isMounted = true;
    sanity
      .fetchVolunteerPositionBySlug(roleSlug)
      .then((result) => {
        if (!isMounted) return;
        if (result?.role && !resolvedRole?.name) {
          setResolvedRole(result.role);
        }
        if (result?.motorsportRegEvent) {
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
  }, [sanity, roleSlug, resolvedRole?.name]);

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

  const event = role?.motorsportRegEvent;
  const roleReference = resolvedRole || role?.role || null;
  const positionTitle = roleReference?.name?.trim() || "Untitled role";
  const roleCapColor = getVolunteerPointCapColor(roleReference?.pointValue);
  const PositionRoleIcon = getRoleIcon(roleReference?.name || positionTitle);
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
  const showOtherRoles = otherRoles.length > 0;
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
    role?.duration !== undefined && role?.duration !== null && role?.duration !== "";
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
        dates: `${toGoogleCalendarStamp(calendarStartDate)}/${toGoogleCalendarStamp(
          finalCalendarEndDate
        )}`,
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
    a.download = `${calendarTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "event"}.ics`;
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
    const shareUrl = event?.url || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: calendarTitle,
          text: calendarDescription,
          url: shareUrl,
        });
        return;
      } catch (_) {
        return;
      }
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (_) {
        // no-op: clipboard may be blocked in some contexts
      }
    }
  }, [calendarDescription, calendarTitle, event?.url]);

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
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            mb: "0.5rem",
            width: "fit-content",
          }}
        >
          <Link
            to="/volunteer"
            sx={{
              color: "text",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              px: "0.15em",
              mx: "-0.15em",
            }}
          >
            ← Back to volunteer positions
          </Link>
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
                as="img"
                src={imageUrl}
                alt={event?.name || positionTitle}
                {...nonDraggableImageProps}
                sx={{
                  width: "100%",
                  height: ["220px", "260px", "320px"],
                  objectFit: "cover",
                  borderRadius: "18px",
                  mb: "1rem",
                  ...nonDraggableImageSx,
                }}
              />
            )}
            {!hasEventAssigned && (
              <Flex
                sx={{
                  width: "100%",
                  minHeight: ["220px", "260px", "320px"],
                  borderRadius: "18px",
                  mb: "1rem",
                  bg: roleCapColor,
                  color: "white",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PositionRoleIcon size={96} aria-hidden="true" />
              </Flex>
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
              <Box sx={{ p: "1.25rem" }}>
                {event?.name && (
                  <Text
                    as="div"
                    sx={{ fontSize: "sm", fontWeight: "heading", color: "text" }}
                  >
                    {event.name}
                  </Text>
                )}
                {eventDateRange && (
                  <Text
                    as="div"
                    sx={{ fontSize: "sm", color: "gray", mt: "0.1rem" }}
                  >
                    {eventDateRange}
                  </Text>
                )}
                {venueLine && (
                  <Text
                    as="div"
                    sx={{ fontSize: "sm", color: "gray", mt: "0.25rem" }}
                  >
                    {venueLine}
                  </Text>
                )}
                <Flex
                  sx={{
                    mt: "0.95rem",
                    width: "100%",
                    alignItems: "stretch",
                    gap: "0.5rem",
                  }}
                >
                  {event?.url ? (
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
                      }}
                    >
                      Open event in MSR →
                    </OutboundLink>
                  ) : (
                    <Box
                      sx={{
                        flex: "1 1 auto",
                        minWidth: 0,
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: "lightgray",
                        backgroundColor: "lightgray",
                      }}
                    />
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
                            cursor: hasCalendarData ? "pointer" : "not-allowed",
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
                  <Box
                    as="button"
                    type="button"
                    aria-label="Share event"
                    title="Share event"
                    onClick={handleShare}
                    sx={iconActionButtonSx}
                  >
                    <FiShare2 size={16} aria-hidden="true" />
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
              gap: hasMapCoordinates ? "1rem" : 0,
            }}
          >
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
              <Box sx={{ p: "1.5rem" }}>
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
                        <Box as="span" sx={{ display: "inline-flex", lineHeight: 0 }}>
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
                            <Box as="span" sx={{ display: "inline-flex", lineHeight: 0 }}>
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
                            <Box as="span" sx={{ display: "inline-flex", lineHeight: 0 }}>
                              <FaUsers size={14} aria-hidden="true" />
                            </Box>
                            <Box
                              as="span"
                              sx={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}
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
                        <Box as="span" sx={{ display: "inline-flex", lineHeight: 0 }}>
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
              Other Positions
            </Heading>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: ["1fr", "repeat(2, minmax(0, 1fr))"],
                gap: "1.5rem",
              }}
            >
              {otherRoles.map((otherRole) => {
                const otherPositionTitle = getPositionTitle(otherRole);
                const otherDate = otherRole?.motorsportRegEvent?.start;
                const otherDateLabel = otherDate ? formatDate(otherDate) : null;
                const otherImage = normalizeImageUrl(
                  otherRole?.motorsportRegEvent?.imageUrl
                );
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
                      boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
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
                    <Box sx={{ p: "1rem" }}>
                      <Heading
                        as="h3"
                        sx={{ variant: "styles.h4", mt: "0.35rem" }}
                      >
                        {otherPositionTitle}
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
                          sx={{
                            fontSize: "xs",
                            color: "darkgray",
                            mt: "0.35rem",
                          }}
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
