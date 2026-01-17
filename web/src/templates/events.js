/** @jsxImportSource theme-ui */
import React, { useEffect, useMemo, useState } from "react";
import { graphql, Link } from "gatsby";
import {
  mapEdgesToNodes,
  filterOutDocsWithoutSlugs,
  filterOutDocsPublishedInTheFuture
} from "../lib/helpers";
import { Box, Button, Heading } from "@theme-ui/components";
import GraphQLErrorList from "../components/graphql-error-list";
import SEO from "../components/seo";
import Layout from "../containers/layout";
import EventPagePreview from "../components/event-page-preview";
import ContentContainer from "../components/content-container";
import { BoxIcon } from "../components/box-icons";
import { Client } from "../services/FetchClient";

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

export const query = graphql`
query EventPageQuery($skip: Int!, $limit: Int!) {
    site: sanitySiteSettings(_id: {regex: "/(drafts.|)siteSettings/"}) {
      title
      navMenu {
        ...NavMenu
      }
    }
    events: allSanityEvent(
      limit: $limit
      skip: $skip
      sort: {fields: [startTime], order: ASC}
      filter: {slug: {current: {ne: null}}, isActive: {eq: true}}
    ) {
      edges {
        node {
          id
          startTime
          mainImage {
            ...SanityImage
            alt
            asset {
              metadata {
                lqip
              }
            }
          }
          title
          _rawExcerpt
          slug {
            current
          }
          category {
            title
          }
          endTime
          #location {
          #  lat
          #  lng
          #}
          address {
            city
            state
          }
        }
      }
    }
  }
`;

const IndexPage = props => {
  const { data, errors, pageContext } = props;
  const { limit, currentPage } = pageContext

  const site = (data || {}).site;
  const eventNodes = (data || {}).events
    ? mapEdgesToNodes(data.events)
        .filter(filterOutDocsWithoutSlugs)
        .filter(filterOutDocsPublishedInTheFuture)
    : [];
  if (!site && !errors) {
    console.warn(
      'Missing "Site settings". Open the studio at http://localhost:3333 and add some content to "Site settings" and restart the development server.'
    );
  }
  const menuItems = site?.navMenu?.items || [];
  const sanity = useMemo(() => new Client(), []);
  const [liveEvents, setLiveEvents] = useState(eventNodes);
  const currentYear = new Date().getFullYear();
  const categories = useMemo(() => {
    const preferred = [
      "Tech Session",
      "Tour",
      "Non-Club Events",
      "Racing Events",
      "Tech Events",
      "Car Show",
      "Driver Education",
      "Social Events"
    ];
    const unique = new Set(preferred);
    liveEvents.forEach((event) => {
      if (event?.category?.title) unique.add(event.category.title);
    });
    return ["All", ...Array.from(unique)];
  }, [liveEvents]);
  const years = useMemo(() => {
    const unique = new Set();
    liveEvents.forEach((event) => {
      if (!event?.startTime) return;
      unique.add(new Date(event.startTime).getFullYear());
    });
    return Array.from(unique).sort((a, b) => b - a);
  }, [liveEvents]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [pageIndex, setPageIndex] = useState(currentPage || 1);
  useEffect(() => {
    let isMounted = true;
    sanity
      .fetchEvents()
      .then((data) => {
        if (!isMounted) return;
        const normalized = Array.isArray(data)
          ? data.filter(filterOutDocsWithoutSlugs)
          : [];
        setLiveEvents(normalized);
      })
      .catch(() => {
        if (!isMounted) return;
      });
    return () => {
      isMounted = false;
    };
  }, [sanity]);

  useEffect(() => {
    if (!years.length) return;
    const yearStrings = years.map((year) => String(year));
    if (!yearStrings.includes(selectedYear)) {
      setSelectedYear(
        yearStrings.includes(String(currentYear))
          ? String(currentYear)
          : yearStrings[0]
      );
    }
  }, [years, selectedYear, currentYear]);
  useEffect(() => {
    setPageIndex(1);
  }, [selectedCategory, selectedMonth, selectedYear]);

  const monthOptions = [
    { value: "all", label: "All months" },
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" }
  ];
  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedMonth !== "all" ||
    selectedYear !== String(currentYear);
  const selectedMonthLabel =
    monthOptions.find((option) => option.value === selectedMonth)?.label ||
    "All months";
  const filterLabelParts = [];
  if (selectedCategory !== "All") filterLabelParts.push(selectedCategory);
  if (selectedMonth !== "all") filterLabelParts.push(selectedMonthLabel);
  if (selectedYear !== "all") filterLabelParts.push(selectedYear);
  const filterLabel = filterLabelParts.length
    ? filterLabelParts.join(" · ")
    : "All";
  const filteredEvents = liveEvents.filter((event) => {
    if (!event?.startTime) return false;
    const eventDate = new Date(event.startTime);
    const eventYear = eventDate.getFullYear();
    const eventMonth = eventDate.getMonth();
    const matchesCategory =
      selectedCategory === "All" ||
      event?.category?.title === selectedCategory;
    const matchesYear =
      selectedYear === "all" || eventYear === Number(selectedYear);
    const matchesMonth =
      selectedMonth === "all" || eventMonth === Number(selectedMonth);
    return matchesCategory && matchesYear && matchesMonth;
  });
  const pageSize = limit || 12;
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages);
  const paginatedEvents = filteredEvents.slice(
    (safePageIndex - 1) * pageSize,
    safePageIndex * pageSize
  );
  const paginationItems = buildPaginationItems(safePageIndex, totalPages);

  if (errors) {
    return (
      <Layout>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }
  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <SEO
        title={site.title || "Missing title"}
        description="BMW CCA PSR Upcoming Events"
        keywords={site.keywords || []}
      />
      <ContentContainer sx ={{
        pl: ["16px", "16px", "50px", "100px"],
        pr: ["16px", "16px", "50px", "100px"],
        //pr: "16px",
        pt: ["6.5rem","6.5rem","10rem","10rem"],
        pb: "1rem",
      }}>
        <h1 hidden>Welcome to {site.title}</h1>
        <Box sx={{ display: "flex", alignItems: "center", gap: "0.75rem", pb: "1rem" }}>
          <Heading sx={{ variant: "styles.h1", mb: 0 }}>Events</Heading>
          <BoxIcon />
        </Box>
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
            flexDirection: "column",
            gap: "0.75rem"
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {categories.map((category) => {
              const isActive = category === selectedCategory;
              return (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  sx={{
                    variant: "buttons.primary",
                    bg: isActive ? "primary" : "background",
                    color: isActive ? "white" : "text",
                    borderRadius: "999px",
                    px: "1rem",
                    py: "0.35rem",
                    fontSize: "xs",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    "&:hover": {
                      bg: isActive ? "primary" : "highlight",
                      color: isActive ? "white" : "text"
                    }
                  }}
                >
                  {category}
                </Button>
              );
            })}
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <Box>
              <label htmlFor="event-month" sx={{ variant: "text.label" }}>
                Month
              </label>
              <select
                id="event-month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                sx={{
                  display: "block",
                  mt: "0.35rem",
                  px: "0.75rem",
                  py: "0.5rem",
                  borderRadius: "6px",
                  borderColor: "gray",
                  borderStyle: "solid",
                  borderWidth: "1px",
                  minWidth: "180px",
                  backgroundColor: "background"
                }}
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Box>
            <Box>
              <label htmlFor="event-year" sx={{ variant: "text.label" }}>
                Year
              </label>
              <select
                id="event-year"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                sx={{
                  display: "block",
                  mt: "0.35rem",
                  px: "0.75rem",
                  py: "0.5rem",
                  borderRadius: "6px",
                  borderColor: "gray",
                  borderStyle: "solid",
                  borderWidth: "1px",
                  minWidth: "140px",
                  backgroundColor: "background"
                }}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </Box>
            <Box sx={{ alignSelf: "flex-end" }}>
              <Button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedMonth("all");
                  setSelectedYear(String(currentYear));
                }}
                disabled={!hasActiveFilters}
                sx={{
                  variant: "buttons.primary",
                  bg: hasActiveFilters ? "secondary" : "background",
                  color: hasActiveFilters ? "white" : "darkgray",
                  borderRadius: "999px",
                  px: "1.25rem",
                  py: "0.5rem",
                  fontSize: "xs",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: hasActiveFilters ? "pointer" : "not-allowed",
                  "&:hover": {
                    bg: hasActiveFilters ? "primary" : "background",
                    color: hasActiveFilters ? "white" : "darkgray"
                  }
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </Box>
        <Heading
          sx={{
            variant: "styles.h3",
            borderBottomStyle: "solid",
            pb: "3px",
            borderBottomWidth: "3px",
            my: "0.5rem"
          }}
        >
          Events — {filterLabel}
        </Heading>
        <div>
          <ul sx={{
            listStyle: 'none',
            display: 'grid',
            gridGap: 3,
            gridTemplateColumns: [
              "1fr",
              "1fr",
              "repeat(2, minmax(0, 1fr))",
              "repeat(2, minmax(0, 1fr))"
            ],
            gridAutoRows: "minmax(50px, 325px)",
            m: 0,
            p: 0
          }}>
            {paginatedEvents &&
              paginatedEvents.map((node, index) => {
                return <li
                  key={index}>
                    <EventPagePreview {...node} isInList />
                  </li>
            })}
          </ul>
          {!filteredEvents.length && (
            <Box sx={{ mt: "1.5rem", color: "darkgray" }}>
              No events match those filters yet.
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
                    color:
                      safePageIndex === totalPages ? "darkgray" : "text"
                  }
                }}
              >
                Next
              </Button>
            </Box>
          )}
        </div>
      </ContentContainer>
    </Layout>
  );
};

export default IndexPage;
