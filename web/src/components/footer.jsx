/** @jsxImportSource theme-ui */
import { graphql, Link, useStaticQuery } from "gatsby";
import React from "react";
import { Box, Container } from "@theme-ui/components";
import { StaticImage } from "gatsby-plugin-image";
import { OutboundLink } from "gatsby-plugin-google-gtag";
import { FiExternalLink } from "react-icons/fi";

const normalizeRoute = (route) => {
  if (!route) return null;
  return route.startsWith("/") ? route : `/${route}`;
};

const getFooterLink = (item) => {
  if (item?.landingPageRoute?.slug?.current) {
    return {
      href: `/${item.landingPageRoute.slug.current}`,
      external: false,
    };
  }
  if (item?.route) {
    return {
      href: normalizeRoute(item.route),
      external: false,
    };
  }
  if (item?.href) {
    return {
      href: item.href,
      external: true,
    };
  }
  return null;
};

const STATIC_FOOTER_INTERNAL_PATHS = new Set([
  "/zundfolge",
  "/zundfolge/archive",
  "/events",
  "/partners",
  "/volunteer",
]);

const STATIC_FOOTER_EXTERNAL_PATHS = new Set([
  "https://cdn.bmwcca.org/static/join/index.html",
]);

const isStaticFooterDestination = (href, external) => {
  if (!href) return false;
  const normalized = external
    ? href
    : href.endsWith("/") && href !== "/"
    ? href.slice(0, -1)
    : href;

  if (external) {
    return STATIC_FOOTER_EXTERNAL_PATHS.has(normalized);
  }
  return STATIC_FOOTER_INTERNAL_PATHS.has(normalized);
};

const collectMenuLinks = (items = [], depth = 0) =>
  items.flatMap((item, index) => {
    if (item?.navigationItemUrl?.items?.length > 0) {
      return collectMenuLinks(item.navigationItemUrl.items, depth + 1);
    }

    const resolved = getFooterLink(item);
    if (!resolved) return [];

    return [
      {
        key: item._key || `${depth}-${index}-${item.title || resolved.href}`,
        title: item.title || resolved.href,
        href: resolved.href,
        external: resolved.external,
        depth,
      },
    ];
  });

const formatGroupTitle = (title = "") =>
  title.replace(/^Dropdown\s*-\s*/i, "").trim() || "Menu";

const preventDrag = (event) => {
  event.preventDefault();
};

const Footer = ({ siteTitle, navMenuItems = [] }) => {
  const data = useStaticQuery(graphql`
    query FooterNavigationMenusQuery {
      allSanityNavigationMenu(sort: { fields: [title], order: ASC }) {
        nodes {
          id
          title
          items {
            ... on SanityNavigationItem {
              _key
              _type
              title
              navigationItemUrl {
                title
                items {
                  ... on SanityLink {
                    _key
                    _type
                    title
                    route
                    href
                    landingPageRoute {
                      ... on SanityRoute {
                        slug {
                          current
                        }
                      }
                    }
                  }
                  ... on SanityNavigationItem {
                    _key
                    _type
                    title
                    navigationItemUrl {
                      title
                      items {
                        ... on SanityLink {
                          _key
                          _type
                          title
                          route
                          href
                          landingPageRoute {
                            ... on SanityRoute {
                              slug {
                                current
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            ... on SanityLink {
              _key
              _type
              title
              route
              href
              landingPageRoute {
                ... on SanityRoute {
                  slug {
                    current
                  }
                }
              }
            }
          }
        }
      }
    }
  `);

  const allMenus = data?.allSanityNavigationMenu?.nodes || [];
  const referencedDropdownTitles = new Set(
    navMenuItems.map((item) => item?.navigationItemUrl?.title).filter(Boolean)
  );

  const groupedMenuLinks = navMenuItems
    .map((item, groupIndex) => {
      const links =
        item?.navigationItemUrl?.items?.length > 0
          ? collectMenuLinks(item.navigationItemUrl.items)
          : (() => {
              const resolved = getFooterLink(item);
              if (!resolved) return [];
              if (isStaticFooterDestination(resolved.href, resolved.external))
                return [];
              return [
                {
                  key:
                    item._key || `${groupIndex}-${item.title || resolved.href}`,
                  title: item.title || resolved.href,
                  href: resolved.href,
                  external: resolved.external,
                  depth: 0,
                },
              ];
            })();

      if (links.length === 0) return null;

      return {
        key: item._key || `menu-${groupIndex}`,
        title: item.title || item.navigationItemUrl.title || "Menu",
        links,
      };
    })
    .filter(Boolean)
    .concat(
      allMenus
        .filter((menu) => {
          if (!menu?.title || menu.title === "Main Nav") return false;
          return !referencedDropdownTitles.has(menu.title);
        })
        .map((menu) => {
          const links = collectMenuLinks(menu.items || []);
          if (links.length === 0) return null;
          return {
            key: menu.id || menu.title,
            title: formatGroupTitle(menu.title),
            links,
          };
        })
        .filter(Boolean)
    );

  const menuGroupCount = groupedMenuLinks.length;
  const mediumColumns =
    menuGroupCount > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr";
  const largeColumns =
    menuGroupCount > 2
      ? "repeat(3, minmax(0, 1fr))"
      : `repeat(${Math.max(menuGroupCount, 1)}, minmax(0, 1fr))`;
  const extraLargeColumns =
    menuGroupCount > 3
      ? "repeat(4, minmax(0, 1fr))"
      : `repeat(${Math.max(menuGroupCount, 1)}, minmax(0, 1fr))`;

  return (
    <div
      sx={{
        fontSize: "sm",
        color: "gray",
        bg: "darkgray",
        textDecoration: "none",
        width: "100%",
        left: 0,
        bottom: 0,
      }}
    >
      <Container
        sx={{
          display: "grid",
          gridTemplateColumns: ["1fr", "1fr", "auto 1fr auto"],
          gap: "1.5rem",
          alignItems: "start",
          maxWidth: "1200px",
          mx: "auto",
          px: ["16px", "16px", "50px", "100px"],
          py: "2rem",
        }}
      >
        <Box
          sx={{
            display: ["grid", "grid", "none"],
            gridColumn: "1 / -1",
            gridTemplateColumns: "auto 1fr",
            alignItems: "flex-start",
            columnGap: "1rem",
            rowGap: "0.6rem",
            mb: "0.25rem",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            <Link
              to="/"
              draggable={false}
              onDragStart={preventDrag}
              sx={{ textDecoration: "none", userSelect: "none" }}
            >
              <StaticImage
                alt="BMW CCA PSR"
                src="../images/new-logo.png"
                placeholder="blurred"
                layout="constrained"
                width={84}
                draggable={false}
                onDragStart={preventDrag}
                imgStyle={{
                  objectFit: "contain",
                  filter: "grayscale(100%)",
                  userSelect: "none",
                  WebkitUserDrag: "none",
                }}
                style={{
                  width: "84px",
                  display: "block",
                  filter: "grayscale(100%)",
                }}
              />
            </Link>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: ["1fr", "repeat(2, minmax(0, 1fr))"],
              gap: "0.45rem 0.9rem",
              px: "0.85rem",
            }}
          >
            <Link
              to="/zundfolge/"
              sx={{
                textDecoration: "none",
                color: "gray",
                ":hover": { color: "background" },
              }}
            >
              Zündfolge
            </Link>
            <Link
              to="/events"
              sx={{
                textDecoration: "none",
                color: "gray",
                ":hover": { color: "background" },
              }}
            >
              Events
            </Link>
            <Link
              to="/zundfolge/archive"
              sx={{
                textDecoration: "none",
                color: "gray",
                ":hover": { color: "background" },
              }}
            >
              Archive
            </Link>
            <Link
              to="/partners"
              sx={{
                textDecoration: "none",
                color: "gray",
                ":hover": { color: "background" },
              }}
            >
              Partners
            </Link>
            <Link
              to="/volunteer"
              sx={{
                textDecoration: "none",
                color: "gray",
                ":hover": { color: "background" },
              }}
            >
              Volunteer
            </Link>
            <OutboundLink
              href="https://cdn.bmwcca.org/static/join/index.html"
              rel="noopener noreferrer"
              target="_blank"
              sx={{
                textDecoration: "none",
                color: "gray",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                ":hover": { color: "background" },
              }}
            >
              Join
              <FiExternalLink size={12} aria-hidden="true" />
            </OutboundLink>
          </Box>
        </Box>
        <Box
          sx={{
            display: ["none", "none", "flex"],
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <Link
            to="/"
            draggable={false}
            onDragStart={preventDrag}
            sx={{ textDecoration: "none", userSelect: "none" }}
          >
            <StaticImage
              alt="BMW CCA PSR"
              src="../images/new-logo.png"
              placeholder="blurred"
              layout="constrained"
              width={105}
              draggable={false}
              onDragStart={preventDrag}
              imgStyle={{
                objectFit: "contain",
                filter: "grayscale(100%)",
                userSelect: "none",
                WebkitUserDrag: "none",
              }}
              style={{
                width: "105px",
                display: "block",
                filter: "grayscale(100%)",
              }}
            />
          </Link>
        </Box>
        <Box
          sx={{
            display: ["none", "none", "grid"],
            gridTemplateColumns: [
              "1fr",
              "repeat(2, minmax(0, 1fr))",
              "repeat(3, minmax(0, 1fr))",
            ],
            gap: "0.6rem 2rem",
            px: "0.85rem",
          }}
        >
          <Link
            to="/zundfolge/"
            sx={{
              textDecoration: "none",
              color: "gray",
              ":hover": { color: "background" },
            }}
          >
            Zündfolge
          </Link>
          <Link
            to="/events"
            sx={{
              textDecoration: "none",
              color: "gray",
              ":hover": { color: "background" },
            }}
          >
            Events
          </Link>
          <Link
            to="/zundfolge/archive"
            sx={{
              textDecoration: "none",
              color: "gray",
              ":hover": { color: "background" },
            }}
          >
            Archive
          </Link>
          <Link
            to="/partners"
            sx={{
              textDecoration: "none",
              color: "gray",
              ":hover": { color: "background" },
            }}
          >
            Partners
          </Link>
          <Link
            to="/volunteer"
            sx={{
              textDecoration: "none",
              color: "gray",
              ":hover": { color: "background" },
            }}
          >
            Volunteer
          </Link>
          <OutboundLink
            href="https://cdn.bmwcca.org/static/join/index.html"
            rel="noopener noreferrer"
            target="_blank"
            sx={{
              textDecoration: "none",
              color: "gray",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              ":hover": { color: "background" },
            }}
          >
            Join
            <FiExternalLink size={14} aria-hidden="true" />
          </OutboundLink>
        </Box>
        <Box
          sx={{
            display: ["none", "none", "flex"],
            justifyContent: ["flex-start", "flex-start", "flex-end"],
            alignItems: "flex-start",
          }}
        >
          <OutboundLink
            href="https://www.bmwcca.org/"
            rel="noopener noreferrer"
            target="_blank"
            draggable={false}
            onDragStart={preventDrag}
            sx={{ display: "inline-flex", userSelect: "none" }}
          >
            <img
              src="/images/bmwcca.png"
              alt="BMW CCA"
              draggable={false}
              sx={{
                width: "145px",
                height: "auto",
                filter: "grayscale(100%)",
                userSelect: "none",
                WebkitUserDrag: "none",
              }}
            />
          </OutboundLink>
        </Box>
        {groupedMenuLinks.length > 0 ? (
          <Box
            sx={{
              gridColumn: ["1", "1", "1 / -1"],
              mt: "0.25rem",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: [
                  "1fr",
                  mediumColumns,
                  largeColumns,
                  extraLargeColumns,
                ],
                gap: [
                  "1rem 1.25rem",
                  "1rem 1.75rem",
                  "1rem 2.25rem",
                  "1rem 2.75rem",
                ],
                width: "100%",
              }}
            >
              {groupedMenuLinks.map((group) => (
                <Box key={group.key}>
                  <Box
                    sx={{
                      color: "gray",
                      fontSize: "13px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      opacity: 0.9,
                      mb: "0.45rem",
                      fontWeight: 600,
                    }}
                  >
                    {group.title}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    {group.links.map((item) => {
                      const indent = `${0.7 + item.depth * 0.5}rem`;
                      if (item.external) {
                        return (
                          <OutboundLink
                            key={item.key}
                            href={item.href}
                            rel="noopener noreferrer"
                            target="_blank"
                            sx={{
                              textDecoration: "none",
                              color: "gray",
                              fontSize: "14px",
                              lineHeight: "1.4",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              pl: indent,
                              ml: "0.1rem",
                              opacity: 0.95,
                              ":hover": { color: "background" },
                            }}
                          >
                            {item.title}
                            <FiExternalLink size={10} aria-hidden="true" />
                          </OutboundLink>
                        );
                      }

                      return (
                        <Link
                          key={item.key}
                          to={item.href}
                          sx={{
                            textDecoration: "none",
                            color: "gray",
                            fontSize: "14px",
                            lineHeight: "1.4",
                            pl: indent,
                            ml: "0.1rem",
                            opacity: 0.95,
                            ":hover": { color: "background" },
                          }}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}
        <Box sx={{ gridColumn: ["1", "1", "1 / -1"], mt: "0.5rem" }}>
          <Box
            as="hr"
            sx={{
              border: "none",
              borderTop: "1px solid",
              borderColor: "gray",
              opacity: 0.4,
              my: "0.75rem",
            }}
          />
          <Box
            sx={{
              fontSize: ["11px", "11px", "xs"],
              color: "gray",
              lineHeight: "1.6",
              mt: "0.5rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            © {new Date().getFullYear()} BMW Car Club of America
            <Box as="span" sx={{ opacity: 0.6 }}>
              |
            </Box>
            <Link
              to="/privacy-policy"
              sx={{
                textDecoration: "none",
                color: "gray",
                ":hover": { color: "background" },
              }}
            >
              Privacy Policy
            </Link>
            <Box as="span" sx={{ opacity: 0.6 }}>
              |
            </Box>
            <Link
              to="/terms-of-use"
              sx={{
                textDecoration: "none",
                color: "gray",
                ":hover": { color: "background" },
              }}
            >
              Terms of Use
            </Link>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default Footer;
