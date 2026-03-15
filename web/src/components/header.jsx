/** @jsxImportSource theme-ui */
import { useBreakpointIndex } from "@theme-ui/match-media";
import { Container, Flex, Divider, MenuButton, Close, Text } from "theme-ui";
import { Link } from "gatsby";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "@reach/router";
import Dropdown from "./dropdown";
import NavLink from "./navLink";
import Logo from "./logo";
import MobileNavLink from "./mobileNavLink";
import MobileCTALink from "./mobileCTALink";

const normalizePath = (value) => {
  if (!value) return "/";
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
};

const getItemPath = (item) => {
  if (item?.landingPageRoute?.slug?.current) {
    return `/${item.landingPageRoute.slug.current}`;
  }
  return item?.route || null;
};

const isVolunteerMenuItem = (item) => {
  if (item?._type !== "link") return false;
  return normalizePath(getItemPath(item)) === "/volunteer";
};

const MOBILE_LOGO_MAX_SCALE = 0.9;
const MOBILE_LOGO_MIN_SCALE = 0.5;
const MOBILE_LOGO_SCROLL_RANGE = 140;
const DESKTOP_LOGO_MAX_SCALE = 1;
const DESKTOP_LOGO_MIN_SCALE = 0.92;
const DESKTOP_LOGO_SCROLL_RANGE = 220;

const getMobileLogoScale = (scrollY = 0) => {
  if (scrollY <= 0) return MOBILE_LOGO_MAX_SCALE;
  const progress = Math.min(scrollY / MOBILE_LOGO_SCROLL_RANGE, 1);
  return (
    MOBILE_LOGO_MAX_SCALE -
    progress * (MOBILE_LOGO_MAX_SCALE - MOBILE_LOGO_MIN_SCALE)
  );
};

const getDesktopLogoScale = (scrollY = 0) => {
  if (scrollY <= 0) return DESKTOP_LOGO_MAX_SCALE;
  const progress = Math.min(scrollY / DESKTOP_LOGO_SCROLL_RANGE, 1);
  return (
    DESKTOP_LOGO_MAX_SCALE -
    progress * (DESKTOP_LOGO_MAX_SCALE - DESKTOP_LOGO_MIN_SCALE)
  );
};

const Header = ({ showNav, siteTitle, scrolled, navMenuItems = [] }) => {
  const [isToggledOn, setToggle] = useState(false);
  const [isVolunteerHovered, setIsVolunteerHovered] = useState(false);
  const [isOtherDesktopNavHovered, setIsOtherDesktopNavHovered] =
    useState(false);
  const [mobileLogoScale, setMobileLogoScale] = useState(MOBILE_LOGO_MAX_SCALE);
  const [desktopLogoScale, setDesktopLogoScale] = useState(
    DESKTOP_LOGO_MAX_SCALE
  );
  const toggle = () => setToggle(!isToggledOn);
  const index = useBreakpointIndex();
  const location = useLocation();
  const isVolunteerPage =
    location.pathname === "/volunteer" ||
    location.pathname.startsWith("/volunteer/");
  const borderBottomColor = isVolunteerPage
    ? isOtherDesktopNavHovered
      ? "primary"
      : "secondary"
    : isVolunteerHovered
    ? "secondary"
    : "primary";
  useEffect(() => {
    const html = document.querySelector("html");
    isToggledOn
      ? (html.style.overflow = "hidden")
      : (html.style.overflow = "visible");
  }, [isToggledOn]);
  useEffect(() => {
    setIsVolunteerHovered(false);
    setIsOtherDesktopNavHovered(false);
  }, [location.pathname]);
  const mobileMenuItems = useMemo(() => {
    const items = Array.isArray(navMenuItems) ? navMenuItems : [];
    const volunteerItems = items.filter(isVolunteerMenuItem);
    const remainingItems = items.filter((item) => !isVolunteerMenuItem(item));
    return [...volunteerItems, ...remainingItems];
  }, [navMenuItems]);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const updateLogoScale = () => {
      const scrollY = window.scrollY || 0;
      const nextMobileScale = getMobileLogoScale(scrollY);
      const nextDesktopScale = getDesktopLogoScale(scrollY);
      setMobileLogoScale((prev) =>
        Math.abs(prev - nextMobileScale) < 0.001 ? prev : nextMobileScale
      );
      setDesktopLogoScale((prev) =>
        Math.abs(prev - nextDesktopScale) < 0.001 ? prev : nextDesktopScale
      );
    };
    updateLogoScale();
    window.addEventListener("scroll", updateLogoScale, { passive: true });
    window.addEventListener("resize", updateLogoScale);
    return () => {
      window.removeEventListener("scroll", updateLogoScale);
      window.removeEventListener("resize", updateLogoScale);
    };
  }, []);
  const mobileLogoTransform = `scale(${mobileLogoScale})`;
  const desktopLogoTransform = `scale(${desktopLogoScale})`;

  return (
    <>
      <div sx={{ overflowX: "hidden", position: "relative", zIndex: 1300 }}>
        <nav
          sx={{
            backgroundColor: "lightgray",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            width: "100%",
            borderBottom: "6px solid",
            borderBottomColor,
            transition: "border-bottom-color 180ms ease",
            boxShadow:
              "0 3px 5px -1px rgba(0, 0, 0, 0.3), 0 1px 18px 0 rgba(0, 0, 0, 0.32), 0 6px 10px 0 rgba(0, 0, 0, 0.24)",
          }}
        >
          <div sx={{ position: "relative", zIndex: 20, overflow: "visible" }}>
            <Container
              sx={{
                flexWrap: "wrap",
                mt: "0px",
                overflow: "visible",
              }}
            >
              <Flex
                sx={{
                  mx: "auto",
                  display: "flex",
                  alignItems: "start",
                  pl: ["16px", "16px", "50px", "100px"],
                }}
              >
                <Link
                  activeClassName="active"
                  id="siteTitle"
                  to="/"
                  sx={{
                    "--desktop-logo-gap": "16px",
                    "--desktop-logo-width": "clamp(130px, 14vw, 175px)",
                    color: "text",
                    textDecoration: "none",
                    display: "flex",
                    position: "absolute",
                    zIndex: 1250,
                    left: [
                      "16px",
                      "16px",
                      "max(24px, calc((100vw - 1000px) / 2 - var(--desktop-logo-width) - var(--desktop-logo-gap)))",
                      "max(32px, calc((100vw - 1000px) / 2 - var(--desktop-logo-width) - var(--desktop-logo-gap)))",
                    ],
                    transform: [
                      mobileLogoTransform,
                      mobileLogoTransform,
                      desktopLogoTransform,
                      desktopLogoTransform,
                    ],
                    transformOrigin: [
                      "top left",
                      "top left",
                      "top right",
                      "top right",
                    ],
                    transition: "transform 90ms linear",
                  }}
                >
                  <Logo />
                </Link>
                <div sx={{ mx: "auto" }} />
                {showNav && navMenuItems && (
                  <div sx={{ height: "60px", pr: "1rem" }}>
                    {index > 2 ? (
                      <ul
                        sx={{
                          justifyContent: "end",
                          alignItems: "center",
                          display: "inline-flex",
                          height: "100%",
                          p: "0px",
                          m: "0px",
                        }}
                      >
                        {navMenuItems.map((i, index) => {
                          if (i.navigationItemUrl) {
                            return (
                              <Dropdown
                                key={i._key || `desktop-dropdown-${index}`}
                                {...i}
                                onVolunteerHoverChange={setIsVolunteerHovered}
                                onNonVolunteerHoverChange={
                                  setIsOtherDesktopNavHovered
                                }
                              />
                            );
                          }
                          if (i._type === "link") {
                            return (
                              <NavLink
                                key={i._key || `desktop-link-${index}`}
                                {...i}
                                sx={{ height: "100%" }}
                                onVolunteerHoverChange={setIsVolunteerHovered}
                                onNonVolunteerHoverChange={
                                  setIsOtherDesktopNavHovered
                                }
                              />
                            );
                          }
                          return null;
                        })}
                      </ul>
                    ) : (
                      <div
                        sx={{ display: "inline-flex", alignItems: "center" }}
                      >
                        {!isToggledOn ? (
                          <MenuButton
                            aria-label="open menu"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              p: 0,
                              width: "56px",
                              height: "56px",
                              "& > svg": {
                                width: "30px",
                                height: "30px",
                              },
                            }}
                            onClick={toggle}
                          />
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </Flex>
              <Flex>
                {isToggledOn ? (
                  <div
                    sx={{
                      backgroundColor: "lightgray",
                      position: "fixed",
                      width: "100%",
                      height: "100vh",
                      display: "block",
                      my: "-60px",
                      pt: "4px",
                      pb: "32px",
                      zIndex: 1400,
                    }}
                  >
                    <div
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        pr: "1rem",
                      }}
                    >
                      <Close
                        aria-label="close menu"
                        onClick={toggle}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          p: 0,
                          width: "56px",
                          height: "56px",
                          "& > svg": {
                            width: "30px",
                            height: "30px",
                          },
                        }}
                      />
                    </div>
                    <ul
                      sx={{
                        listStyle: "none",
                        textAlign: "center",
                        mt: "0.75rem",
                        p: 0,
                        backgroundColor: "lightgray",
                      }}
                    >
                      {mobileMenuItems.map((i, index) => {
                        const link = i.navigationItemUrl;
                        const isVolunteerItem = isVolunteerMenuItem(i);
                        const showDivider = !(isVolunteerItem && index === 0);
                        if (i.navigationItemUrl) {
                          return (
                            <ul
                              key={i._key || `mobile-menu-${index}`}
                              sx={{
                                listStyle: "none",
                                margin: 0,
                                padding: 0,
                                color: "text",
                              }}
                            >
                              <li
                                sx={{
                                  display: "block",
                                  height: "100%",
                                  //mx: "0.5rem",
                                }}
                              >
                                {showDivider && (
                                  <Divider sx={{ color: "darkgray" }} />
                                )}
                                <Text variant="text.label">{i.title}</Text>
                                {link.items && link.items.length > 0 ? (
                                  <div
                                    sx={{
                                      listStyle: "none",
                                      m: 0,
                                      p: 0,
                                      display: "flex",
                                      flexDirection: "column",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {link.items.map((subLink, subIndex) => (
                                      <MobileNavLink
                                        key={
                                          subLink._key ||
                                          subLink.title ||
                                          `mobile-sub-link-${index}-${subIndex}`
                                        }
                                        {...subLink}
                                      />
                                    ))}
                                  </div>
                                ) : null}
                              </li>
                            </ul>
                          );
                        }
                        if (i._type === "link") {
                          return (
                            <div key={i._key || `mobile-link-${index}`}>
                              {showDivider && (
                                <Divider sx={{ color: "darkgray" }} />
                              )}
                              <MobileNavLink key={i._key} {...i} />
                            </div>
                          );
                        }
                        if (i._type === "cta") {
                          return (
                            <div key={i._key || `mobile-cta-${index}`}>
                              {showDivider && (
                                <Divider sx={{ color: "darkgray" }} />
                              )}
                              <MobileCTALink key={i._key} {...i} />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  </div>
                ) : null}
              </Flex>
            </Container>
          </div>
        </nav>
      </div>
      <div sx={{ mt: ["65px"] }} />
    </>
  );
};

export default Header;
