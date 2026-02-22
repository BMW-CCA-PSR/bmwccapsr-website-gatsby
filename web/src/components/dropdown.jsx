/** @jsxImportSource theme-ui */
import React from "react";
import { Link } from "gatsby";
import { Box, Text } from "@theme-ui/components";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import { useLocation } from "@reach/router";
import {
  FaBook,
  FaCalendarAlt,
  FaCarSide,
  FaFlagCheckered,
  FaHandsHelping,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaNewspaper,
  FaRoute,
  FaStar,
  FaToolbox,
  FaTrophy,
  FaUsers,
  FaWrench,
  FaUserFriends,
} from "react-icons/fa";

const fixedSlantClip =
  "polygon(var(--nav-slant-size) 0, 100% 0, calc(100% - var(--nav-slant-size)) 100%, 0 100%)";

const normalizePath = (value) => {
  if (!value) return null;
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
};

const getDestinationPath = (item) => {
  if (item?.landingPageRoute?.slug?.current) {
    return normalizePath(`/${item.landingPageRoute.slug.current}`);
  }
  if (item?.route) return normalizePath(item.route);
  return null;
};

const normalizeImageUrl = (value) => {
  if (!value) return null;
  if (value.startsWith("//")) return `https:${value}`;
  return value;
};

const MENU_ICON_MAP = {
  car: FaCarSide,
  route: FaRoute,
  "map-pin": FaMapMarkerAlt,
  calendar: FaCalendarAlt,
  users: FaUsers,
  social: FaUserFriends,
  tools: FaToolbox,
  wrench: FaWrench,
  flag: FaFlagCheckered,
  book: FaBook,
  trophy: FaTrophy,
  news: FaNewspaper,
  volunteer: FaHandsHelping,
  info: FaInfoCircle,
  star: FaStar,
};

const Dropdown = (props) => {
  const link = props.navigationItemUrl;
  const subLinks = Array.isArray(link?.items) ? link.items : [];
  const handleVolunteerHoverChange = props.onVolunteerHoverChange;
  const handleNonVolunteerHoverChange = props.onNonVolunteerHoverChange;
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState(0);
  const [panelShiftX, setPanelShiftX] = React.useState(0);
  const [isPanelPositioned, setIsPanelPositioned] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const isChildActive = subLinks.some((subLink) => {
    const path = getDestinationPath(subLink);
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  });
  const activeChildIndex = subLinks.findIndex((subLink) => {
    const path = getDestinationPath(subLink);
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  });
  const selectedIndex = Math.min(
    Math.max(0, hoveredIndex),
    Math.max(0, subLinks.length - 1)
  );
  const selectedSubLink = subLinks[selectedIndex] || null;
  const selectedImageUrl = normalizeImageUrl(
    selectedSubLink?.image?.asset?.url || null
  );
  const selectedDescription = selectedSubLink?.description?.trim() || "";
  const selectedDestination = getDestinationPath(selectedSubLink);
  const selectedTitle =
    selectedSubLink?.title ||
    selectedDestination ||
    selectedSubLink?.href ||
    "Link";

  React.useEffect(() => {
    if (!isOpen) return;
    setHoveredIndex(activeChildIndex >= 0 ? activeChildIndex : 0);
  }, [activeChildIndex, isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      setIsPanelPositioned(false);
      return undefined;
    }
    const margin = 20;
    const adjustPanelPosition = () => {
      const panel = panelRef.current;
      const anchor = dropdownRef.current;
      if (!panel || !anchor) return;
      const anchorRect = anchor.getBoundingClientRect();
      const panelWidth = panel.offsetWidth || 0;
      const viewportWidth =
        document.documentElement?.clientWidth || window.innerWidth;
      const viewportMaxLeft = viewportWidth - margin - panelWidth;
      const clampedLeft = Math.min(
        Math.max(anchorRect.left, margin),
        Math.max(margin, viewportMaxLeft)
      );
      const nextShift = clampedLeft - anchorRect.left;
      setPanelShiftX(nextShift);
      setIsPanelPositioned(true);
    };
    const rafId = window.requestAnimationFrame(adjustPanelPosition);
    window.addEventListener("resize", adjustPanelPosition);
    window.addEventListener("scroll", adjustPanelPosition, { passive: true });
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", adjustPanelPosition);
      window.removeEventListener("scroll", adjustPanelPosition);
    };
  }, [isOpen]);

  const openMenu = () => {
    setIsOpen(true);
    if (handleVolunteerHoverChange) handleVolunteerHoverChange(false);
    if (handleNonVolunteerHoverChange) handleNonVolunteerHoverChange(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    if (handleNonVolunteerHoverChange) handleNonVolunteerHoverChange(false);
  };

  const activeLinkStyles = isChildActive
    ? {
        color: "background",
        "--nav-bg-opacity": 1,
        WebkitTextStroke: "0.35px currentColor",
        textShadow: "0 0 0.01px currentColor",
      }
    : {};
  return (
    <ul
      sx={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        width: "100%",
        color: "darkgray",
        height: "100%",
        textAlign: "center",
      }}
    >
      <li
        ref={dropdownRef}
        onMouseEnter={openMenu}
        onMouseLeave={closeMenu}
        role="menuitem"
        tabIndex={-1}
        sx={{
          textTransform: "uppercase",
          position: "relative",
          height: "100%",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          onFocus={openMenu}
          onBlur={(event) => {
            const nextTarget = event.relatedTarget;
            if (
              dropdownRef.current &&
              nextTarget &&
              dropdownRef.current.contains(nextTarget)
            ) {
              return;
            }
            closeMenu();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeMenu();
          }}
          sx={{
            textDecoration: "none",
            px: "1.35rem",
            cursor: "default",
            display: "flex",
            height: "100%",
            alignItems: "center",
            textAlign: "center",
            justifyContent: "center",
            width: "100%",
            color: isChildActive ? "background" : "darkgray",
            background: "none",
            border: "none",
            font: "inherit",
            position: "relative",
            isolation: "isolate",
            "--nav-slant-size": "14px",
            "--nav-bg-opacity": 0,
            transition: "color 160ms ease",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundColor: "primary",
              clipPath: fixedSlantClip,
              WebkitClipPath: fixedSlantClip,
              opacity: "var(--nav-bg-opacity)",
              transition: "opacity 160ms ease",
              zIndex: 0,
            },
            ...(isOpen
              ? {
                  color: "background",
                  "--nav-bg-opacity": 1,
                }
              : {}),
            ...activeLinkStyles,
          }}
          aria-haspopup={subLinks.length > 0 ? true : false}
          aria-expanded={subLinks.length > 0 ? isOpen : undefined}
        >
          <span
            className={isChildActive ? "dropdown-label dropdown-label--active" : "dropdown-label"}
            sx={{
              position: "relative",
              zIndex: 1,
              display: "block",
              maxWidth: "9.25ch",
              lineHeight: 1.05,
              whiteSpace: "normal",
              textAlign: "center",
              "&::after": {
                content: '""',
                display: "block",
                width: "100%",
                height: "2px",
                mt: "0.22rem",
                borderRadius: "999px",
                bg: "currentColor",
                opacity: 0,
                transform: "scaleX(0.72)",
                transformOrigin: "center",
                transition: "opacity 160ms ease, transform 160ms ease",
              },
              "&.dropdown-label--active::after": {
                opacity: 1,
                transform: "scaleX(1)",
              },
            }}
          >
            {props.title}
          </span>
        </button>
        {subLinks.length > 0 ? (
          <Box
            as="div"
            ref={panelRef}
            sx={{
              textTransform: "none",
              p: "0.45rem",
              display: "grid",
              gridTemplateColumns: "minmax(185px, 0.9fr) minmax(200px, 1.1fr)",
              columnGap: "0.45rem",
              width: "min(520px, calc(100vw - 40px))",
              backgroundColor: "primary",
              visibility: isOpen && isPanelPositioned ? "visible" : "hidden",
              opacity: isOpen && isPanelPositioned ? 1 : 0,
              position: "absolute",
              marginTop: 0,
              top: "calc(100% - 1px)",
              left: 0,
              transform: `translateX(${panelShiftX}px)`,
              transition: "opacity 130ms ease",
              textAlign: "center",
              right: "auto",
              cursor: "pointer",
              borderBottomLeftRadius: "18px",
              borderBottomRightRadius: "18px",
              overflow: "hidden",
              maxHeight: "70vh",
              pointerEvents: isOpen && isPanelPositioned ? "auto" : "none",
              boxShadow:
                "0 12px 18px rgba(0, 0, 0, 0.18), 0 4px 8px rgba(0, 0, 0, 0.12)",
            }}
            aria-label="submenu"
          >
            <Box
              as="ul"
              sx={{
                listStyle: "none",
                m: 0,
                p: 0,
                width: "100%",
                backgroundColor: "transparent",
                overflowY: "auto",
              }}
            >
              {subLinks.map((subLink, index) => {
                const destinationPath = getDestinationPath(subLink);
                const linkTitle =
                  subLink?.title ||
                  destinationPath ||
                  subLink?.href ||
                  `Link ${index + 1}`;
                const rowKey = subLink._key || `${linkTitle}-${index}`;
                const rowSx = {
                  width: "auto",
                  textDecoration: "none",
                  color: "background",
                  py: "0.46rem",
                  px: "0.72rem",
                  mx: "0.16rem",
                  my: "0.14rem",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  lineHeight: 1.2,
                  minHeight: "3.35rem",
                  backgroundColor:
                    index === selectedIndex ? "secondary" : "transparent",
                  transition: "background-color 120ms ease",
                  "&:hover": {
                    backgroundColor: "secondary",
                  },
                };
                const MenuIcon = MENU_ICON_MAP[subLink?.icon];
                const linkContent = (
                  <Box
                    as="span"
                    sx={{
                      width: "100%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "0.5rem",
                    }}
                  >
                    {MenuIcon ? (
                      <Box
                        as="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flex: "0 0 auto",
                          width: "30px",
                          height: "30px",
                          borderRadius: "999px",
                          bg: "rgba(255,255,255,0.16)",
                          lineHeight: 0,
                        }}
                      >
                        <MenuIcon size={20} aria-hidden="true" />
                      </Box>
                    ) : null}
                    <Box
                      as="span"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        textAlign: "left",
                      }}
                    >
                      {linkTitle}
                    </Box>
                  </Box>
                );
                return (
                  <li key={rowKey}>
                    {subLink?.href ? (
                      <OutboundLink
                        href={subLink.href}
                        rel="noopener noreferrer"
                        target="_blank"
                        onClick={closeMenu}
                        onMouseEnter={() => setHoveredIndex(index)}
                        sx={rowSx}
                      >
                        {linkContent}
                      </OutboundLink>
                    ) : (
                      <Link
                        to={destinationPath || "/"}
                        onClick={closeMenu}
                        onMouseEnter={() => setHoveredIndex(index)}
                        sx={rowSx}
                      >
                        {linkContent}
                      </Link>
                    )}
                  </li>
                );
              })}
            </Box>
            <Box
              sx={{
                bg: "background",
                color: "text",
                p: "0.7rem",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                minHeight: "100%",
                borderRadius: "12px",
                overflowY: "auto",
              }}
            >
              {selectedImageUrl ? (
                <Box
                  as="img"
                  src={selectedImageUrl}
                  alt={selectedTitle}
                  sx={{
                    display: "block",
                    width: "100%",
                    height: "112px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    mb: "0.5rem",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "112px",
                    borderRadius: "10px",
                    mb: "0.5rem",
                    bg: "lightgray",
                  }}
                />
              )}
              <Text sx={{ variant: "styles.p", fontSize: "xs", mb: 0 }}>
                {selectedDescription ||
                  selectedDestination ||
                  selectedSubLink?.href ||
                  "Select a page to view details."}
              </Text>
            </Box>
          </Box>
        ) : null}
      </li>
    </ul>
  );
};

export default Dropdown;
