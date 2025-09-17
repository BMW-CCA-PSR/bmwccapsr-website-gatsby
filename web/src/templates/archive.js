/** @jsxImportSource theme-ui */
import React, { useState, useEffect } from "react";
import { Link, graphql } from "gatsby";

import { Container, Heading, Text, Card, Box } from "@theme-ui/components";
import GraphQLErrorList from "../components/graphql-error-list";
import SEO from "../components/seo";
import Layout from "../containers/layout";

export const query = graphql`
  query ArchivePageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
  }
`;

const IndexPage = props => {
  const { data, errors, pageContext } = props;

  const site = (data || {}).site;

  const [selectedYear, setSelectedYear] = useState(null);
  const [issues, setIssues] = useState([]);
  const [years, setYears] = useState([]);
  const [manifest, setManifest] = useState(null);

  // Configure decades and manual enable/disable toggles here
  const DECADES = [
    { key: '1970s', start: 1970, end: 1979, enabled: true },
    { key: '1980s', start: 1980, end: 1989, enabled: true },
    { key: '1990s', start: 1990, end: 1999, enabled: true },
    { key: "2000s", start: 2000, end: 2009, enabled: true },
    { key: "2010s", start: 2010, end: 2019, enabled: true },
  ];

  // Load manifest once, derive years and default selected year
  useEffect(() => {
    fetch("/zundfolge/manifest.json")
      .then(res => res.json())
      .then(data => {
        setManifest(data);
        const parsedYears = Object.keys(data)
          .map((y) => parseInt(y, 10))
          .filter((n) => !isNaN(n))
          .sort((a, b) => b - a);
        setYears(parsedYears);
        if (!selectedYear && parsedYears.length > 0) {
          setSelectedYear(parsedYears[0]);
        }
      })
      .catch(err => {
        console.error("Failed to load manifest", err);
        setYears([]);
      });
  }, []);

  // Recompute issues when selected year changes
  useEffect(() => {
    if (!selectedYear || !manifest) return;

    const monthNames = [
      'January','February','March','April','May','June','July','August','September','October','November','December'
    ];

    function parseMonths(entry) {
      const lc = entry.toLowerCase();
      // Prefer explicit two-month patterns first (e.g., 1-2, 11.12)
      const two = lc.match(/(?:^|[_-])(\d{1,2})[.-](\d{1,2})(?:$|[^\d])/);
      if (two) {
        const a = parseInt(two[1], 10);
        const b = parseInt(two[2], 10);
        if (a >= 1 && a <= 12 && b >= 1 && b <= 12) return [a, b];
      }
      // Common one-month patterns (year-month at end or in middle)
      const oneHyphenEnd = lc.match(/-(\d{1,2})(?:[^\d]|$)/); // e.g., 90-10, 89-5
      if (oneHyphenEnd) {
        const m = parseInt(oneHyphenEnd[1], 10);
        if (m >= 1 && m <= 12) return [m];
      }
      const oneUnderscore = lc.match(/_(\d{1,2})(?:[^\d]|$)/); // e.g., 2019_4
      if (oneUnderscore) {
        const m = parseInt(oneUnderscore[1], 10);
        if (m >= 1 && m <= 12) return [m];
      }
      const midDashMonth = lc.match(/-(\d{2})-/); // e.g., Zundfolge-1976-02-February
      if (midDashMonth) {
        const m = parseInt(midDashMonth[1], 10);
        if (m >= 1 && m <= 12) return [m];
      }
      // Month names
      const monthNameIdx = monthNames
        .map((n, i) => ({ i: i + 1, re: new RegExp(n.toLowerCase()) }))
        .find(obj => obj.re.test(lc));
      if (monthNameIdx) return [monthNameIdx.i];
      return [];
    }

    function labelFor(entry, totalCount, indexInYear) {
      const months = parseMonths(entry);
      const toName = (m) => monthNames[m - 1] || String(m);
      if (totalCount === 4) {
        // Treat as quarterly issues; use position for clarity
        return `Qtr ${indexInYear + 1}`;
      }
      if (totalCount === 6) {
        if (months.length === 2) return `${toName(months[0]).slice(0,3)}/${toName(months[1]).slice(0,3)}`;
        if (months.length === 1) {
          const m = months[0];
          const start = m % 2 === 0 ? m - 1 : m;
          const end = Math.min(start + 1, 12);
          return `${toName(start).slice(0,3)}/${toName(end).slice(0,3)}`;
        }
        return '';
      }
      // Default monthly (or irregular) handling
      if (months.length === 2) {
        return `${toName(months[0]).slice(0,3)}/${toName(months[1]).slice(0,3)}`; // handles 11.12 -> Nov/Dec
      }
      if (months.length === 1) {
        return toName(months[0]);
      }
      return '';
    }

    function monthKey(entry, fallbackIndex) {
      const months = parseMonths(entry);
      if (months.length === 0) return 100 + fallbackIndex; // stable fallback after real months
      return Math.min(...months);
    }

    const entries = manifest[String(selectedYear)] || [];
    const total = entries.length;
    // Sort by month for yearly/bimonthly cases (>= 6 entries). Preserve order for 4 (quarterly)
    const sorted = total >= 6 ? entries.slice().sort((a, b) => monthKey(a, 0) - monthKey(b, 0)) : entries;
    const mapped = sorted.map((name, idx) => {
      const jpg = `https://bmw-club-psr.s3.amazonaws.com/zundfolge/${selectedYear}/${name}.jpg`;
      const base = name; // original manifest token
      const label = labelFor(base, total, idx) || base.split("_")[1] || base;
      const pdfUrl = `https://bmw-club-psr.s3.amazonaws.com/zundfolge/${selectedYear}/${base}.pdf`;
      return { jpg, pdfUrl, label };
    });
    setIssues(mapped);
  }, [selectedYear, manifest]);

  if (errors) {
    return (
      <Layout>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  if (!site) {
    console.warn(
      'Missing "Site settings". Open the studio at http://localhost:3333 and add some content to "Site settings" and restart the development server.'
    );
  }
  const menuItems = site.navMenu && (site.navMenu.items || []);

  // years are derived from manifest; fallback if fetch fails
  const fallbackYears = years && years.length ? years : Array.from({ length: 2022 - 1970 }, (_, i) => 1970 + i).reverse();

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <SEO
        title={site.title || "Missing title"}
        description="BMW CCA PSR Zundfolge Online"
        keywords={site.keywords || []}
      />
      <Container sx ={{
        pl: ["16px", "16px", "50px", "100px"],
        pr: ["16px", "16px", "50px", "100px"],
        //pr: "16px",
        pt: ["6.5rem","6.5rem","10rem","10rem"],
        pb: "1rem",
      }}>
        <h1 hidden>Welcome to {site.title}</h1>
        <Heading sx={{variant: "styles.h1", pb: "1rem"}}>Zündfolge Archive</Heading>
        <Text>
          Since its founding, the Puget Sound chapter of the BMW CCA has published <em>Zündfolge</em>—a printed newsletter dedicated to informing members about upcoming events, technical tips, club news, and shared experiences with the marque. From 1970 through 2021, <em>Zündfolge</em> chronicled the life and passion of our BMW community in the Pacific Northwest. This archive serves as a curated digital record of that legacy, preserving over five decades of enthusiasm, expertise, and camaraderie.
        </Text>
        <Heading sx={{variant: "styles.h3", borderBottomStyle: "solid", pb: "3px", borderBottomWidth: "3px", my: "0.5rem"}}>All Issues</Heading>
        {/*
        <div sx={{display: "flex", flexDirection: "column", mt: 3}}>
          <Heading sx={{variant: "styles.h3", borderBottomStyle: "solid", pb: "3px", borderBottomWidth: "3px", my: "0.5rem"}}>Issues by Decade</Heading>
          <div sx={{
            display: 'grid',
            gridTemplateColumns: ['1fr', '1fr 1fr', 'repeat(3, 1fr)'],
            gap: 3,
            mb: 4,
          }}>
            {DECADES.map(dec => {
              const hasContent = years.some(y => y >= dec.start && y <= dec.end);
              const disabled = !dec.enabled || !hasContent;
              return (
                <Card key={dec.key} sx={{
                  position: 'relative',
                  p: 3,
                  borderRadius: '8px',
                  borderStyle: 'solid',
                  borderColor: 'black',
                  borderWidth: '1px',
                  background: disabled ? '#f6f6f6' : 'linear-gradient(to top, transparent 50%, black 100%)',
                  overflow: 'hidden',
                }}>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Heading as="h4" sx={{ color: disabled ? 'gray' : 'white', mb: 2 }}>{dec.key}</Heading>
                    <Text sx={{ color: disabled ? 'gray' : 'white', opacity: disabled ? 0.8 : 0.9 }}>
                      {dec.start} – {dec.end}
                    </Text>
                    {disabled ? (
                      <Text sx={{ mt: 2, color: 'gray', fontWeight: 'bold' }}>Coming Soon</Text>
                    ) : (
                      <div sx={{ mt: 3 }}>
                        <button
                          onClick={() => {
                            const decadeYears = years.filter(y => y >= dec.start && y <= dec.end);
                            if (decadeYears.length) setSelectedYear(decadeYears[0]);
                          }}
                          sx={{
                            variant: 'buttons.primary',
                            bg: 'white',
                            color: 'primary',
                            '&:hover': { transform: 'translateY(-1px)' },
                          }}
                        >
                          View
                        </button>
                      </div>
                    )}
                  </Box>
                </Card>
              );
            })}
          </div>
        </div>
        */}
        <div sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "6px", mb: "2rem" }}>
          {fallbackYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              sx={{
                variant: "buttons.primary",
                backgroundColor: selectedYear === year ? "primary" : "muted",
                color: selectedYear === year ? "background" : "text",
                py: "8px",
                px: "10px",
                borderRadius: "4px",
                m: 0,
                border: "none",
                boxShadow: "none",
              }}
            >
              {year}
            </button>
          ))}
        </div>

        {selectedYear && (
          <div>
            <Heading as="h4" sx={{ mt: "1rem", mb: "0.5rem" }}>{selectedYear}</Heading>
            <div sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", mt: "1rem" }}>
              {issues.map((issue) => {
                return (
                  <div key={issue.jpg} sx={{ textAlign: "center", width: "198px", mx: "auto" }}>
                    <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={issue.jpg}
                        alt={`Zündfolge ${selectedYear} Issue ${issue.label}`}
                        sx={{
                          width: "198px",
                          height: "255px",
                          borderRadius: "4px",
                          boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                          ":hover": {
                            transform: "scale(1.05)",
                            boxShadow: "0 0 12px rgba(0,0,0,0.3)"
                          }
                        }}
                      />
                    </a>
                    <Text sx={{ mt: 2, fontWeight: "bold" }}>{issue.label}</Text>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Container>
    </Layout>
  );
};

export default IndexPage;