/** @jsxImportSource theme-ui */
import React, { useState, useEffect } from "react";
import { Link, graphql } from "gatsby";

import { Container, Heading, Text } from "@theme-ui/components";
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

  const [selectedYear, setSelectedYear] = useState(2021);
  const [thumbnails, setThumbnails] = useState([]);

  useEffect(() => {
    if (!selectedYear) return;

    fetch("/zundfolge/manifest.json")
      .then(res => res.json())
      .then(data => {
        const entries = data[String(selectedYear)] || [];
        const urls = entries.map(name =>
          `https://bmw-club-psr.s3.amazonaws.com/zundfolge/${selectedYear}/${name}.jpg`
        );
        setThumbnails(urls);
      })
      .catch(err => {
        console.error("Failed to load manifest or year data", err);
        setThumbnails([]);
      });
  }, [selectedYear]);

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

  const years = Array.from({ length: 2022 - 1970 }, (_, i) => 1970 + i);

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
        <div sx={{display: "flex", flexDirection: "column"}}>
          <div sx={{pb: "0.5rem"}}></div>
        </div>
        <Heading sx={{variant: "styles.h3", borderBottomStyle: "solid", pb: "3px", borderBottomWidth: "3px", my: "0.5rem"}}>Issues by Year</Heading>
        <div sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))", gap: "2px", mb: "2rem" }}>
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              sx={{
                variant: "buttons.primary",
                backgroundColor: selectedYear === year ? "primary" : "muted",
                color: selectedYear === year ? "background" : "text",
                py: "5px",
                px: "5px",
                borderRadius: "2px",
                m: 0,
                border: "none",
                boxShadow: "none"
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
              {thumbnails.map((src, idx) => {
                const baseName = src.split("/").pop().replace(".jpg", "");
                const pdfUrl = `https://bmw-club-psr.s3.amazonaws.com/zundfolge/${selectedYear}/${baseName}.pdf`;
                const label = baseName.split("_")[1] || baseName;
                return (
                  <div key={src} sx={{ textAlign: "center" }}>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      <img src={src} alt={`Zündfolge ${selectedYear} Issue ${label}`} sx={{ width: "100%", height: "auto", borderRadius: "4px", boxShadow: "0 0 6px rgba(0,0,0,0.2)" }} />
                    </a>
                    <Text sx={{ mt: 2, fontWeight: "bold" }}>{label}</Text>
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