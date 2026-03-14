/** @jsxImportSource theme-ui */
import React, { useEffect, useMemo, useState } from "react";
import { graphql } from "gatsby";
import { mapEdgesToNodes, filterOutDocsWithoutSlugs } from "../lib/helpers";
import { Box, Button, Heading, Text } from "@theme-ui/components";
import { FiSliders } from "react-icons/fi";
import GraphQLErrorList from "../components/graphql-error-list";
import Seo from "../components/seo";
import Layout from "../containers/layout";
import EventPagePreview from "../components/event-page-preview";
import ContentContainer from "../components/content-container";
import { BoxIcon } from "../components/box-icons";
import { Client } from "../services/FetchClient";
import {
  FilterBox,
  FilterField,
  FilterGrid,
  FilterPillButton,
  FilterPillRow,
  FilterSearchField,
  FilterSelect,
} from "../components/filter-ui";

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
  { value: "11", label: "December" },
];

const sortOptions = [
  { value: "dateAsc", label: "Date: Soonest" },
  { value: "dateDesc", label: "Date: Latest" },
  { value: "titleAsc", label: "Title: A-Z" },
  { value: "titleDesc", label: "Title: Z-A" },
];

export const query = graphql`
  query EventPageQuery($skip: Int!, $limit: Int!) {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    events: allSanityEvent(
      limit: $limit
      skip: $skip
      sort: { fields: [startTime], order: ASC }
      filter: { slug: { current: { ne: null } } }
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
            line1
            line2
            city
            state
          }
          venueName
          onlineEvent
          onlineLink
        }
      }
    }
  }
`;

const IndexPage = (props) => {
  const { data, errors, pageContext } = props;
  const { limit, currentPage } = pageContext;

  const site = (data || {}).site;
  const eventNodes = (data || {}).events
    ? mapEdgesToNodes(data.events).filter(filterOutDocsWithoutSlugs)
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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [activeOnly, setActiveOnly] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSort, setSelectedSort] = useState("dateAsc");
  const [pageIndex, setPageIndex] = useState(currentPage || 1);
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);
  const locationSearch = props.location?.search || "";
  const activeLiveEvents = useMemo(() => {
    const now = Date.now();
    return liveEvents.filter((event) => {
      if (!event?.startTime) return false;
      const startTimestamp = Date.parse(event.startTime);
      const endTimestamp = event?.endTime ? Date.parse(event.endTime) : NaN;
      if (Number.isFinite(endTimestamp)) {
        return endTimestamp >= now;
      }
      return Number.isFinite(startTimestamp) && startTimestamp >= now;
    });
  }, [liveEvents]);
  const scopedEvents = activeOnly ? activeLiveEvents : liveEvents;
  const categories = useMemo(() => {
    const unique = new Set();
    scopedEvents.forEach((event) => {
      if (event?.category?.title) unique.add(event.category.title);
    });
    const sorted = Array.from(unique).sort((a, b) => a.localeCompare(b));
    return [
      { value: "all", label: "All categories" },
      ...sorted.map((value) => ({ value, label: value })),
    ];
  }, [scopedEvents]);
  const allYears = useMemo(() => {
    const unique = new Set();
    liveEvents.forEach((event) => {
      if (!event?.startTime) return;
      unique.add(new Date(event.startTime).getFullYear());
    });
    return Array.from(unique).sort((a, b) => b - a);
  }, [liveEvents]);
  const years = useMemo(() => {
    const unique = new Set();
    scopedEvents.forEach((event) => {
      if (!event?.startTime) return;
      unique.add(new Date(event.startTime).getFullYear());
    });
    return Array.from(unique).sort((a, b) => b - a);
  }, [scopedEvents]);
  useEffect(() => {
    let isMounted = true;
    sanity
      .fetchAllEvents()
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
    if (hasInitializedFilters) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(locationSearch);
    const categoryParam = params.get("category");
    const monthParam = params.get("month");
    const yearParam = params.get("year");
    const activeParam = params.get("active");
    const queryParam = params.get("q");
    const sortParam = params.get("sort");
    const requestActiveOnly = !(activeParam === "0" || activeParam === "false");
    if (!requestActiveOnly) {
      setActiveOnly(false);
    }
    if (categoryParam) {
      const requestedCategories = categoryParam
        .split(",")
        .map((category) => category.trim())
        .filter(Boolean);
      if (requestedCategories.length) {
        setSelectedCategories([requestedCategories[0]]);
      }
    }
    if (
      monthParam &&
      monthOptions.some((option) => option.value === monthParam)
    ) {
      setSelectedMonth(monthParam);
    }
    const validYears = requestActiveOnly ? years : allYears;
    if (yearParam && validYears.includes(Number(yearParam))) {
      setSelectedYear(yearParam);
    }
    if (queryParam) {
      setSearchTerm(queryParam.trim());
    }
    if (sortParam && sortOptions.some((option) => option.value === sortParam)) {
      setSelectedSort(sortParam);
    }
    setHasInitializedFilters(true);
  }, [hasInitializedFilters, locationSearch, years, allYears]);

  useEffect(() => {
    if (selectedYear === "all") return;
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
  }, [
    selectedCategories,
    selectedMonth,
    selectedYear,
    activeOnly,
    searchTerm,
    selectedSort,
  ]);

  useEffect(() => {
    if (!hasInitializedFilters) return;
    if (typeof window === "undefined") return;
    const normalizePathname = (value) => {
      if (!value || value === "/") return "/";
      if (/^\/events\/?$/.test(value)) return "/events/";
      return value;
    };
    const params = new URLSearchParams(locationSearch);
    if (selectedCategories.length) {
      params.set("category", selectedCategories[0]);
    } else {
      params.delete("category");
    }
    if (selectedMonth !== "all") {
      params.set("month", selectedMonth);
    } else {
      params.delete("month");
    }
    if (selectedYear !== String(currentYear)) {
      params.set("year", selectedYear);
    } else {
      params.delete("year");
    }
    if (!activeOnly) {
      params.set("active", "0");
    } else {
      params.delete("active");
    }
    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    } else {
      params.delete("q");
    }
    if (selectedSort !== "dateAsc") {
      params.set("sort", selectedSort);
    } else {
      params.delete("sort");
    }
    const nextSearch = params.toString();
    const normalizedPathname = normalizePathname(window.location.pathname);
    const nextUrl = nextSearch
      ? `${normalizedPathname}?${nextSearch}`
      : normalizedPathname;
    window.history.replaceState({}, "", nextUrl);
  }, [
    hasInitializedFilters,
    locationSearch,
    selectedCategories,
    selectedMonth,
    selectedYear,
    activeOnly,
    searchTerm,
    selectedSort,
    currentYear,
  ]);
  const selectedMonthLabel =
    monthOptions.find((option) => option.value === selectedMonth)?.label ||
    "All months";
  const selectedCategoryValue = selectedCategories[0] || "all";
  const selectedCategoryLabel =
    categories.find((item) => item.value === selectedCategoryValue)?.label ||
    "All categories";
  const filterLabelParts = [];
  if (selectedCategoryValue !== "all") {
    filterLabelParts.push(selectedCategoryLabel);
  }
  if (selectedMonth !== "all") filterLabelParts.push(selectedMonthLabel);
  if (selectedYear !== "all") filterLabelParts.push(selectedYear);
  if (searchTerm.trim()) filterLabelParts.push(`"${searchTerm.trim()}"`);
  const hasAnyFilterSelections =
    selectedCategories.length > 0 ||
    selectedMonth !== "all" ||
    selectedYear !== String(currentYear) ||
    !activeOnly ||
    selectedSort !== "dateAsc" ||
    searchTerm.trim().length > 0;
  const filterLabel = filterLabelParts.length
    ? filterLabelParts.join(" · ")
    : "All";
  const eventsHeading = activeOnly
    ? "Upcoming events"
    : "All events (including historical)";
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredEvents = scopedEvents.filter((event) => {
    if (!event?.startTime) return false;
    const eventDate = new Date(event.startTime);
    const eventYear = eventDate.getFullYear();
    const eventMonth = eventDate.getMonth();
    const haystack = [
      event?.title,
      event?.category?.title,
      event?.venueName,
      event?.address?.line1,
      event?.address?.line2,
      event?.address?.city,
      event?.address?.state,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (normalizedSearch && !haystack.includes(normalizedSearch)) return false;
    const matchesCategory =
      selectedCategoryValue === "all" ||
      event?.category?.title === selectedCategoryValue;
    const matchesYear =
      selectedYear === "all" || eventYear === Number(selectedYear);
    const matchesMonth =
      selectedMonth === "all" || eventMonth === Number(selectedMonth);
    return matchesCategory && matchesYear && matchesMonth;
  });
  const sortedEvents = useMemo(() => {
    const list = [...filteredEvents];
    list.sort((a, b) => {
      if (selectedSort === "dateDesc") {
        return Date.parse(b?.startTime || 0) - Date.parse(a?.startTime || 0);
      }
      if (selectedSort === "titleAsc") {
        return String(a?.title || "").localeCompare(String(b?.title || ""));
      }
      if (selectedSort === "titleDesc") {
        return String(b?.title || "").localeCompare(String(a?.title || ""));
      }
      return Date.parse(a?.startTime || 0) - Date.parse(b?.startTime || 0);
    });
    return list;
  }, [filteredEvents, selectedSort]);
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedMonth("all");
    setSelectedYear(String(currentYear));
    setActiveOnly(true);
    setSearchTerm("");
    setSelectedSort("dateAsc");
    setPageIndex(1);
  };
  const pageSize = limit || 12;
  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages);
  const paginatedEvents = sortedEvents.slice(
    (safePageIndex - 1) * pageSize,
    safePageIndex * pageSize
  );
  const paginationItems = buildPaginationItems(safePageIndex, totalPages);
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
        title={site.title || "Missing title"}
        description="BMW CCA PSR Upcoming Events"
        keywords={site.keywords || []}
      />
      <ContentContainer
        sx={{
          pl: ["16px", "16px", "50px", "100px"],
          pr: ["16px", "16px", "50px", "100px"],
          //pr: "16px",
          pt: ["6.5rem", "6.5rem", "10rem", "10rem"],
          pb: "1rem",
        }}
      >
        <h1 hidden>Welcome to {site.title}</h1>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            pb: "0.35rem",
          }}
        >
          <Heading sx={{ variant: "styles.h1", mb: 0 }}>Events</Heading>
          <BoxIcon />
        </Box>
        <Text
          sx={{
            variant: "styles.p",
            fontSize: "16pt",
            color: "text",
            maxWidth: "760px",
            mb: "0.75rem",
          }}
        >
          Discover upcoming drives, clinics, social gatherings, and club
          meetings across the region. Use the filters below to find events that
          fit your interests and schedule.
        </Text>
        <FilterBox>
          <FilterGrid sx={{ gridTemplateColumns: ["1fr"] }}>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <FilterSearchField
                label="Search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search events, venue, category"
                clearLabel="Reset filters"
                clearDisabled={!hasAnyFilterSelections}
                onClear={handleResetFilters}
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
                    onClick={() => setActiveOnly(true)}
                    active={activeOnly}
                    activeBg="primary"
                    activeHoverBg="secondary"
                    sx={{ flex: "1 1 0" }}
                  >
                    Active
                  </FilterPillButton>
                  <FilterPillButton
                    type="button"
                    onClick={() => {
                      setActiveOnly(false);
                      setSelectedYear("all");
                    }}
                    active={!activeOnly}
                    activeBg="primary"
                    activeHoverBg="secondary"
                    sx={{ flex: "1 1 0" }}
                  >
                    All
                  </FilterPillButton>
                </FilterPillRow>
              </FilterField>
              <FilterField label="Category">
                <FilterSelect
                  value={selectedCategoryValue}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (next === "all") {
                      setSelectedCategories([]);
                      return;
                    }
                    setSelectedCategories([next]);
                  }}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </FilterSelect>
              </FilterField>
              <FilterField label="Month">
                <FilterSelect
                  id="event-month"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FilterSelect>
              </FilterField>

              <FilterField label="Year">
                <FilterSelect
                  id="event-year"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                >
                  <option value="all">All years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </FilterSelect>
              </FilterField>
            </Box>
          </FilterGrid>
        </FilterBox>
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
            {eventsHeading} — {filterLabel}
          </Heading>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              justifySelf: "end",
              ...sortControlSx,
            }}
          >
            <FiSliders size={20} />
            <FilterSelect
              aria-label="Sort events"
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
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </Box>
        </Box>
        <div>
          <ul
            sx={{
              listStyle: "none",
              display: "grid",
              gridGap: 3,
              gridTemplateColumns: [
                "1fr",
                "1fr",
                "repeat(2, minmax(0, 1fr))",
                "repeat(2, minmax(0, 1fr))",
              ],
              m: 0,
              p: 0,
            }}
          >
            {paginatedEvents &&
              paginatedEvents.map((node, index) => {
                return (
                  <li key={index}>
                    <EventPagePreview {...node} isInList showUpcomingPill />
                  </li>
                );
              })}
          </ul>
          {!filteredEvents.length && (
            <Box sx={{ mt: "1.5rem", color: "darkgray" }}>
              No events match those filters yet.{" "}
              <Button
                onClick={handleResetFilters}
                sx={{
                  bg: "transparent",
                  color: "primary",
                  p: 0,
                  m: 0,
                  border: "none",
                  minHeight: "auto",
                  fontSize: "inherit",
                  fontWeight: "body",
                  textDecoration: "underline",
                  cursor: "pointer",
                  "&:hover": {
                    color: "secondary",
                    bg: "transparent",
                  },
                }}
              >
                Reset filters
              </Button>
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
                    bg:
                      safePageIndex === totalPages ? "lightgray" : "highlight",
                    color: safePageIndex === totalPages ? "darkgray" : "text",
                  },
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
