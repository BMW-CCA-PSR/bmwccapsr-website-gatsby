/** @jsxImportSource theme-ui */
import React, { useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { graphql, Link } from "gatsby";
import { Box, Button, Heading, Text } from "@theme-ui/components";
import {
  FaAward,
  FaCalendarAlt,
  FaCogs,
  FaStar,
  FaTools,
  FaUserPlus,
} from "react-icons/fa";
import { FiChevronDown, FiDownload } from "react-icons/fi";
import Layout from "../../containers/layout";
import Seo from "../../components/seo";
import GraphQLErrorList from "../../components/graphql-error-list";
import ContentContainer from "../../components/content-container";
import { BoxIcon } from "../../components/box-icons";
import StylizedLandingHeader from "../../components/stylized-landing-header";
import CategoryFilterButtons from "../../components/category-filter-buttons";
import { FilterSearchField } from "../../components/filter-ui";
import { mapEdgesToNodes } from "../../lib/helpers";
import headerLogo from "../../images/new-logo.png";
import {
  getVolunteerRoleIconComponent,
  getVolunteerRolePresentationColor,
} from "../../lib/volunteerRolePresentation";

export const query = graphql`
  query VolunteerRolesPageQuery {
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
    }
    roles: allSanityVolunteerFixedRole(
      sort: { fields: [pointValue, name], order: [ASC, ASC] }
    ) {
      edges {
        node {
          id
          name
          description
          pointValue
          roleScope
          icon
          color
        }
      }
    }
  }
`;

const PAGE_SIZE = 4;

const SKILL_TABS = [
  {
    key: "entry",
    label: "Entry",
    icon: FaUserPlus,
    points: [1, 2],
    bg: "#e8f7ec",
    hoverBg: "#d4f1dd",
    accent: "#1f7a3f",
  },
  {
    key: "intermediate",
    label: "Intermediate",
    icon: FaTools,
    points: [3, 4],
    bg: "#fff6d5",
    hoverBg: "#ffe9a6",
    accent: "#8b6b00",
  },
  {
    key: "advanced",
    label: "Advanced",
    icon: FaAward,
    points: [5, 10],
    bg: "#ffe6e6",
    hoverBg: "#ffd1d1",
    accent: "#9a1f1f",
  },
];

const buildPaginationItems = (current, total, delta = 1) => {
  if (total <= 5) {
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

const ROLE_BROWSE_FILTERS = [
  {
    value: "track-driving",
    label: "Track & Driving",
    pattern:
      /(car control|ccc|autocross|track|hpde|driving|instructor|coach|mentor)/i,
  },
  {
    value: "ops-admin",
    label: "Ops & Admin",
    pattern:
      /(registration|check[- ]?in|admin|desk|sign[- ]?in|coordinator|manager|lead|worker|crew)/i,
  },
  {
    value: "safety-tech",
    label: "Safety & Tech",
    pattern: /(safety|medical|first aid|tech|mechanic|inspection|garage)/i,
  },
  {
    value: "media-comms",
    label: "Media & Comms",
    pattern:
      /(communications|announc|pa|social|newsletter|content|photo|media|video)/i,
  },
  {
    value: "hospitality-support",
    label: "Hospitality",
    pattern: /(hospitality|welcome|host|greeter|support|assistant|helper)/i,
  },
];

const getRoleBrowseTags = (name) => {
  const label = String(name || "").trim();
  if (!label) return [];
  return ROLE_BROWSE_FILTERS.filter((item) => item.pattern.test(label)).map(
    (item) => item.value,
  );
};

const getTabKeyForPoints = (value) => {
  const pointValue = Number(value);
  if (pointValue === 1 || pointValue === 2) return "entry";
  if (pointValue === 3 || pointValue === 4) return "intermediate";
  if (pointValue === 5 || pointValue === 10) return "advanced";
  return null;
};

const getSkillTabMeta = (value) => {
  const tabKey = getTabKeyForPoints(value);
  return SKILL_TABS.find((tab) => tab.key === tabKey) || SKILL_TABS[0];
};

const getRoleScopeMeta = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "event") {
    return {
      label: "Event scope",
      icon: FaCalendarAlt,
      bg: "#e6f0ff",
      color: "#1e4f9a",
      borderColor: "rgba(30,79,154,0.35)",
    };
  }
  if (normalized === "program") {
    return {
      label: "Club scope",
      icon: FaCogs,
      bg: "#eef3f5",
      color: "#334155",
      borderColor: "rgba(51,65,85,0.35)",
    };
  }
  return null;
};

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildRoleIconMarkup = (RolePresentationIcon, rolePresentationColor) => {
  if (!RolePresentationIcon) {
    return `<span class="role-icon role-icon-empty" aria-hidden="true"></span>`;
  }

  const svg = renderToStaticMarkup(
    <RolePresentationIcon size={16} aria-hidden="true" focusable="false" />,
  );
  const iconBg = rolePresentationColor || "#1f2937";

  return `
    <span
      class="role-icon"
      aria-hidden="true"
      style="background:${escapeHtml(iconBg)};"
    >
      ${svg}
    </span>
  `;
};

const buildRoleExportDocument = (roles) => {
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const sections = SKILL_TABS.map((tab) => {
    const tabRoles = roles.filter(
      (role) => getTabKeyForPoints(role?.pointValue) === tab.key,
    );
    if (!tabRoles.length) return "";

    const cards = tabRoles.map((role) => {
      const roleName = role?.name?.trim() || "Untitled role";
      const descriptionText =
        role?.description?.trim() || "No description available.";
      const RolePresentationIcon = getVolunteerRoleIconComponent(role?.icon);
      const rolePresentationColor = getVolunteerRolePresentationColor(
        role?.color,
      );
      const scopeMeta = getRoleScopeMeta(role?.roleScope);
      const pointValue = Number(role?.pointValue);
      const pointLabel = Number.isFinite(pointValue)
        ? `${pointValue} point${pointValue === 1 ? "" : "s"}`
        : "Points unavailable";

      return `
          <article class="role-card">
            <div class="role-card-header">
              <div class="role-title-wrap">
                ${buildRoleIconMarkup(
                  RolePresentationIcon,
                  rolePresentationColor,
                )}
                <div>
                  <h3>${escapeHtml(roleName)}</h3>
                  <p class="role-meta">
                    ${escapeHtml(pointLabel)}${
                      scopeMeta ? ` • ${escapeHtml(scopeMeta.label)}` : ""
                    }
                  </p>
                </div>
              </div>
            </div>
            <p class="role-description">${escapeHtml(descriptionText)}</p>
          </article>
        `;
    });
    const rows = [];
    for (let index = 0; index < cards.length; index += 2) {
      rows.push(`
        <div class="role-row">
          ${cards[index]}
          ${cards[index + 1] || ""}
        </div>
      `);
    }

    return `
      <section class="role-section">
        <div
          class="role-section-header"
          style="background:${escapeHtml(tab.bg)}; color:${escapeHtml(
            tab.accent,
          )}; border-color:${escapeHtml(tab.accent)};"
        >
          <h2>${escapeHtml(tab.label)} Roles</h2>
          <p>${escapeHtml(
            `${tab.points[0]}-${
              tab.points[tab.points.length - 1]
            } point opportunities`,
          )}</p>
        </div>
        <div class="role-grid">
          ${rows.join("")}
        </div>
      </section>
    `;
  })
    .filter(Boolean)
    .join("");

  return `
    <style>
      .pdf-export-doc {
        color-scheme: light;
        margin: 0;
        font-family: "Avenir Next", "Helvetica Neue", Arial, sans-serif;
        color: #111827;
        background: #f7f7f5;
      }
      .pdf-export-doc,
      .pdf-export-doc * {
        box-sizing: border-box;
      }
      .pdf-export-doc .page {
        width: 980px;
        max-width: 980px;
        margin: 0;
        padding: 40px 36px 56px;
        background: white;
      }
      .pdf-export-doc .header {
        border-bottom: 2px solid #111827;
        padding-bottom: 18px;
        margin-bottom: 24px;
      }
      .pdf-export-doc .header-top {
        display: flex;
        align-items: flex-start;
        gap: 24px;
      }
      .pdf-export-doc .header-logo {
        width: 128px;
        height: 128px;
        object-fit: contain;
        flex: 0 0 128px;
      }
      .pdf-export-doc .header-copy {
        min-width: 0;
      }
      .pdf-export-doc .eyebrow {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: #6b7280;
        margin: 0 0 12px;
      }
      .pdf-export-doc h1 {
        margin: 0;
        font-size: 34px;
        line-height: 1;
      }
      .pdf-export-doc .intro {
        margin: 12px 0 0;
        font-size: 15px;
        line-height: 1.6;
        color: #374151;
        max-width: 720px;
      }
      .pdf-export-doc .stamp {
        margin-top: 10px;
        font-size: 12px;
        color: #6b7280;
      }
      .pdf-export-doc .role-section {
        margin-top: 24px;
        break-inside: avoid;
      }
      .pdf-export-doc .role-section-header {
        border: 1px solid;
        border-radius: 14px;
        padding: 14px 16px;
        margin-bottom: 14px;
      }
      .pdf-export-doc .role-section-header h2 {
        margin: 0;
        font-size: 18px;
      }
      .pdf-export-doc .role-section-header p {
        margin: 4px 0 0;
        font-size: 13px;
        opacity: 0.88;
      }
      .pdf-export-doc .role-grid {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .pdf-export-doc .role-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .pdf-export-doc .role-card {
        border: 1px solid #d1d5db;
        border-radius: 16px;
        padding: 16px;
        background: white;
        break-inside: avoid;
        min-height: 150px;
      }
      .pdf-export-doc .role-card-header {
        margin-bottom: 12px;
      }
      .pdf-export-doc .role-title-wrap {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .pdf-export-doc .role-icon {
        width: 30px;
        height: 30px;
        min-width: 30px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      .pdf-export-doc .role-icon svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }
      .pdf-export-doc .role-icon-empty {
        background: #d1d5db;
      }
      .pdf-export-doc .role-card h3 {
        margin: 0;
        font-size: 18px;
        line-height: 1.2;
      }
      .pdf-export-doc .role-meta {
        margin: 5px 0 0;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6b7280;
      }
      .pdf-export-doc .role-description {
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
        color: #1f2937;
        white-space: pre-wrap;
      }
      @media print {
        .pdf-export-doc {
          background: white;
        }
        .pdf-export-doc .page {
          padding: 18px 18px 24px;
        }
      }
    </style>
    <div class="pdf-export-doc">
      <main class="page">
        <header class="header">
          <div class="header-top">
            <img
              class="header-logo"
              src="${escapeHtml(headerLogo)}"
              alt="BMW CCA PSR logo"
            />
            <div class="header-copy">
              <p class="eyebrow">BMW CCA PSR Volunteer Program</p>
              <h1>Volunteer Roles</h1>
              <p class="intro">
                A printable reference of every official volunteer role, grouped by
                skill band and formatted for board review, planning, and member
                sharing.
              </p>
              <p class="stamp">Generated ${escapeHtml(generatedAt)}</p>
            </div>
          </div>
        </header>
        ${sections}
      </main>
    </div>
  `;
};

const VolunteerRolesPage = ({ data, errors }) => {
  const site = data?.site;
  const menuItems = site?.navMenu?.items || [];
  const [activeTab, setActiveTab] = useState("entry");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrowseFilters, setSelectedBrowseFilters] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pageByTab, setPageByTab] = useState({
    entry: 1,
    intermediate: 1,
    advanced: 1,
    filtered: 1,
  });

  const roles = useMemo(
    () => (data?.roles ? mapEdgesToNodes(data.roles) : []),
    [data?.roles],
  );

  const rolesBySkill = useMemo(() => {
    const grouped = {
      entry: [],
      intermediate: [],
      advanced: [],
    };

    roles.forEach((role) => {
      const tabKey = getTabKeyForPoints(role?.pointValue);
      if (!tabKey) return;
      grouped[tabKey].push(role);
    });

    return grouped;
  }, [roles]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredRolesBySkill = useMemo(() => {
    const grouped = {
      entry: [],
      intermediate: [],
      advanced: [],
    };

    Object.entries(rolesBySkill).forEach(([tabKey, tabRoles]) => {
      grouped[tabKey] = tabRoles.filter((role) => {
        const roleName = String(role?.name || "").trim();
        const description = String(role?.description || "").trim();
        const matchesSearch = normalizedSearch
          ? `${roleName} ${description}`
              .toLowerCase()
              .includes(normalizedSearch)
          : true;
        if (!matchesSearch) return false;
        if (!selectedBrowseFilters.length) return true;
        const roleTags = getRoleBrowseTags(roleName);
        return selectedBrowseFilters.some((value) => roleTags.includes(value));
      });
    });

    return grouped;
  }, [rolesBySkill, normalizedSearch, selectedBrowseFilters]);

  const activeRoles = useMemo(
    () => filteredRolesBySkill[activeTab] || [],
    [filteredRolesBySkill, activeTab],
  );
  const hasAnyFilterSelections =
    searchTerm.trim().length > 0 || selectedBrowseFilters.length > 0;
  const isFilteredView = hasAnyFilterSelections;
  const activeViewKey = isFilteredView ? "filtered" : activeTab;
  const filteredRoles = useMemo(
    () => SKILL_TABS.flatMap((tab) => filteredRolesBySkill[tab.key] || []),
    [filteredRolesBySkill],
  );
  const visibleRoles = isFilteredView ? filteredRoles : activeRoles;
  const totalPages = Math.max(1, Math.ceil(visibleRoles.length / PAGE_SIZE));
  const activePage = pageByTab[activeViewKey] || 1;
  const safePage = Math.min(activePage, totalPages);

  useEffect(() => {
    if (activePage !== safePage) {
      setPageByTab((prev) => ({ ...prev, [activeViewKey]: safePage }));
    }
  }, [activePage, activeViewKey, safePage]);

  useEffect(() => {
    setPageByTab({
      entry: 1,
      intermediate: 1,
      advanced: 1,
      filtered: 1,
    });
  }, [searchTerm, selectedBrowseFilters]);

  useEffect(() => {
    if (hasAnyFilterSelections) {
      setMobileFiltersOpen(true);
    }
  }, [hasAnyFilterSelections]);

  const paginatedRoles = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return visibleRoles.slice(start, start + PAGE_SIZE);
  }, [safePage, visibleRoles]);

  const paddedRoles = useMemo(() => {
    const blanks = Math.max(0, PAGE_SIZE - paginatedRoles.length);
    return [...paginatedRoles, ...Array.from({ length: blanks }, () => null)];
  }, [paginatedRoles]);

  const paginationItems = useMemo(
    () => buildPaginationItems(safePage, totalPages),
    [safePage, totalPages],
  );

  const currentTab =
    SKILL_TABS.find((tab) => tab.key === activeTab) || SKILL_TABS[0];

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };
  const setPageForActiveTab = (nextPage) => {
    setPageByTab((prev) => ({ ...prev, [activeViewKey]: nextPage }));
  };
  const handleDownloadRoles = async () => {
    if (
      typeof window === "undefined" ||
      typeof document === "undefined" ||
      roles.length === 0 ||
      isExportingPdf
    ) {
      return;
    }

    setIsExportingPdf(true);
    const captureHideStyle = document.createElement("style");
    captureHideStyle.setAttribute("data-html2canvas-hide", "true");
    captureHideStyle.textContent = `
      .html2canvas-container {
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: fixed !important;
        left: -100000px !important;
        top: 0 !important;
      }
      .html2canvas-container iframe {
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(captureHideStyle);

    const exportRoot = document.createElement("div");
    exportRoot.setAttribute("aria-hidden", "true");
    exportRoot.style.position = "absolute";
    exportRoot.style.left = "-100000px";
    exportRoot.style.top = "0";
    exportRoot.style.width = "980px";
    exportRoot.style.height = "0";
    exportRoot.style.overflow = "hidden";
    exportRoot.style.pointerEvents = "none";
    exportRoot.style.background = "transparent";
    exportRoot.style.zIndex = "-1";
    exportRoot.innerHTML = buildRoleExportDocument(roles);
    document.body.appendChild(exportRoot);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
        compress: true,
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 28;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;

      const exportPageWidthPx = 980;
      const maxPageHeightPx = Math.floor(
        (printableHeight * exportPageWidthPx) / printableWidth,
      );
      const sourcePage = exportRoot.querySelector(".page");
      const sourceHeader = sourcePage?.querySelector(".header");
      const sourceSections = Array.from(
        exportRoot.querySelectorAll(".role-section"),
      );

      if (!sourcePage || !sourceHeader || sourceSections.length === 0) {
        throw new Error("Unable to build volunteer roles export.");
      }

      sourcePage.style.position = "absolute";
      sourcePage.style.visibility = "hidden";
      sourcePage.style.pointerEvents = "none";
      sourcePage.style.left = "0";
      sourcePage.style.top = "0";

      const pagesHost = document.createElement("div");
      pagesHost.className = "pdf-export-doc";
      pagesHost.style.position = "relative";
      pagesHost.style.width = `${exportPageWidthPx}px`;
      exportRoot.appendChild(pagesHost);

      const createPage = () => {
        const page = document.createElement("main");
        page.className = "page pdf-page-instance";
        page.appendChild(sourceHeader.cloneNode(true));
        pagesHost.appendChild(page);
        return page;
      };

      const createSectionShell = (sectionHeaderNode) => {
        const section = document.createElement("section");
        section.className = "role-section";
        section.appendChild(sectionHeaderNode);
        const grid = document.createElement("div");
        grid.className = "role-grid";
        section.appendChild(grid);
        return { section, grid };
      };

      let currentPage = createPage();

      sourceSections.forEach((sourceSection) => {
        const sectionHeader = sourceSection
          .querySelector(".role-section-header")
          ?.cloneNode(true);
        const sourceRows = Array.from(
          sourceSection.querySelectorAll(".role-row"),
        );
        if (!sectionHeader || sourceRows.length === 0) return;

        let { section, grid } = createSectionShell(sectionHeader);
        currentPage.appendChild(section);

        if (currentPage.getBoundingClientRect().height > maxPageHeightPx) {
          section.remove();
          currentPage = createPage();
          const nextSection = createSectionShell(sectionHeader.cloneNode(true));
          section = nextSection.section;
          grid = nextSection.grid;
          currentPage.appendChild(section);
        }

        sourceRows.forEach((sourceRow) => {
          const rowClone = sourceRow.cloneNode(true);
          grid.appendChild(rowClone);

          if (currentPage.getBoundingClientRect().height > maxPageHeightPx) {
            rowClone.remove();

            currentPage = createPage();
            const nextSection = createSectionShell(
              sectionHeader.cloneNode(true),
            );
            section = nextSection.section;
            grid = nextSection.grid;
            currentPage.appendChild(section);
            grid.appendChild(rowClone);
          }
        });
      });

      const pdfPages = Array.from(
        pagesHost.querySelectorAll(".pdf-page-instance"),
      );

      for (let index = 0; index < pdfPages.length; index += 1) {
        const pageNode = pdfPages[index];
        const canvas = await html2canvas(pageNode, {
          backgroundColor: "#f7f7f5",
          scale: 2,
          useCORS: true,
          logging: false,
          removeContainer: true,
          width: pageNode.scrollWidth,
          height: pageNode.scrollHeight,
          windowWidth: pageNode.scrollWidth,
          windowHeight: pageNode.scrollHeight,
        });
        const imageData = canvas.toDataURL("image/png");
        const imageHeight = (canvas.height * printableWidth) / canvas.width;

        if (index > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          imageData,
          "PNG",
          margin,
          margin,
          printableWidth,
          imageHeight,
          undefined,
          "FAST",
        );
      }

      pdf.save("bmw-cca-psr-volunteer-roles.pdf");
    } finally {
      document.body.removeChild(exportRoot);
      if (captureHideStyle.parentNode) {
        captureHideStyle.parentNode.removeChild(captureHideStyle);
      }
      setIsExportingPdf(false);
    }
  };

  if (errors) {
    return (
      <Layout navMenuItems={menuItems}>
        <GraphQLErrorList errors={errors} />
      </Layout>
    );
  }

  return (
    <Layout textWhite={false} navMenuItems={menuItems}>
      <Seo title="Volunteer Roles" />
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
            Roles
          </Text>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: ["flex-start", "flex-start", "center"],
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: ["wrap", "wrap", "nowrap"],
            mb: "0.75rem",
          }}
        >
          <Heading
            as="h1"
            sx={{
              variant: "styles.h1",
              mt: 0,
              mb: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            Volunteer Roles
            <BoxIcon
              as="span"
              sx={{
                display: "inline-grid",
                ml: "0.5rem",
                verticalAlign: "middle",
              }}
            />
          </Heading>
          <Box
            sx={{
              display: "grid",
              gap: "0.5rem",
              width: ["100%", "100%", "300px"],
              flex: ["1 1 100%", "1 1 100%", "0 0 300px"],
              justifyItems: ["stretch", "stretch", "end"],
              alignSelf: ["stretch", "stretch", "flex-start"],
            }}
          >
            <Button
              type="button"
              onClick={handleDownloadRoles}
              disabled={roles.length === 0 || isExportingPdf}
              sx={{
                display: ["none", "none", "inline-flex", "inline-flex"],
                width: "100%",
                px: "1rem",
                py: "0.65rem",
                borderRadius: "12px",
                border: "1px solid",
                borderColor:
                  roles.length === 0
                    ? "muted"
                    : isExportingPdf
                      ? "primary"
                      : "secondary",
                backgroundColor:
                  roles.length === 0
                    ? "muted"
                    : isExportingPdf
                      ? "primary"
                      : "secondary",
                color: "white",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                appearance: "none",
                boxShadow: "none",
                filter: "none",
                transform: "none",
                transition: "none",
                cursor:
                  roles.length === 0
                    ? "not-allowed"
                    : isExportingPdf
                      ? "progress"
                      : "pointer",
                fontSize: "xs",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                "&:hover, &:focus, &:active": {
                  backgroundColor:
                    roles.length === 0
                      ? "muted"
                      : isExportingPdf
                        ? "primary"
                        : "primary",
                  borderColor:
                    roles.length === 0
                      ? "muted"
                      : isExportingPdf
                        ? "primary"
                        : "primary",
                  color: "white",
                  boxShadow: "none",
                  filter: "none",
                  transform: "none",
                  outline: "none",
                },
                "&:disabled": {
                  color: roles.length === 0 ? "darkgray" : "white",
                  cursor: isExportingPdf ? "progress" : "not-allowed",
                  boxShadow: "none",
                  filter: "none",
                  transform: "none",
                  opacity: 1,
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
                <FiDownload size={30} aria-hidden="true" />
                <Text as="span" sx={{ fontSize: "xs", color: "inherit" }}>
                  {isExportingPdf ? "Generating PDF" : "Download"}
                </Text>
              </Box>
              {isExportingPdf ? (
                <Box
                  as="span"
                  sx={{
                    width: "18px",
                    height: "18px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "999px",
                    border: "2px solid rgba(255,255,255,0.35)",
                    borderTopColor: "white",
                    animation: "spin 0.8s linear infinite",
                    "@keyframes spin": {
                      from: { transform: "rotate(0deg)" },
                      to: { transform: "rotate(360deg)" },
                    },
                  }}
                />
              ) : null}
            </Button>
          </Box>
        </Box>
        <Text sx={{ variant: "styles.p", fontSize: "16pt", mt: 0, mb: 0 }}>
          Explore the official role lineup our Board has defined to power every
          PSR event. Use this catalog to compare responsibilities, skill level,
          and point value across roles.
        </Text>

        {roles.length === 0 ? (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "lightgray",
              borderRadius: "14px",
              p: "1rem",
              color: "darkgray",
            }}
          >
            No roles have been added in Sanity yet.
          </Box>
        ) : (
          <>
            <Box
              sx={{
                mt: "0.75rem",
                mb: "1rem",
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
                aria-controls="volunteer-filter-panel"
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
                id="volunteer-filter-panel"
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
                  <FilterSearchField
                    label="Search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search role name or description"
                    clearLabel="Clear role filters"
                    clearDisabled={!hasAnyFilterSelections}
                    onClear={() => {
                      setSearchTerm("");
                      setSelectedBrowseFilters([]);
                    }}
                    fieldSx={{ mb: "1rem" }}
                  />
                  <Box
                    sx={{
                      "& button": {
                        mr: "0.6rem",
                        mb: "0.35rem",
                      },
                    }}
                  >
                    <CategoryFilterButtons
                      categories={ROLE_BROWSE_FILTERS.map((item) => ({
                        value: item.value,
                        label: item.label,
                      }))}
                      selectedCategories={selectedBrowseFilters}
                      onChange={setSelectedBrowseFilters}
                      showAll={false}
                      layout="stretch"
                      stretchColumns={5}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                border: "1px solid",
                borderColor: "black",
                borderRadius: "18px",
                bg: "background",
                overflow: "hidden",
                height: ["860px", "860px", "760px", "760px"],
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  borderBottom: "1px solid",
                  borderBottomColor: "black",
                  minHeight: ["56px", "58px", "62px"],
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    opacity: isFilteredView ? 0 : 1,
                    transform: isFilteredView
                      ? "translateY(-8px)"
                      : "translateY(0)",
                    pointerEvents: isFilteredView ? "none" : "auto",
                    transition: "opacity 200ms ease, transform 200ms ease",
                  }}
                >
                  {SKILL_TABS.map((tab) => {
                    const isActive = tab.key === activeTab;
                    const TabIcon = tab.icon;
                    return (
                      <Button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        sx={{
                          appearance: "none",
                          border: "none",
                          borderRadius: 0,
                          p: ["0.85rem", "0.9rem", "1rem"],
                          display: "inline-flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: ["column", "column", "row", "row"],
                          gap: ["0.2rem", "0.25rem", "0.5rem", "0.5rem"],
                          bg: isActive ? tab.bg : "background",
                          color: isActive ? tab.accent : "text",
                          fontWeight: "heading",
                          borderBottom: "4px solid",
                          borderBottomColor: isActive
                            ? tab.accent
                            : "transparent",
                          borderRight: "1px solid",
                          borderRightColor: "black",
                          transition:
                            "background-color 150ms ease, color 150ms ease",
                          ":last-of-type": {
                            borderRight: "none",
                          },
                          "&:hover": {
                            bg: isActive ? tab.bg : tab.hoverBg,
                            color: tab.accent,
                          },
                        }}
                      >
                        <TabIcon size={18} aria-hidden="true" />
                        <Text
                          as="span"
                          sx={{
                            fontSize: ["14px", "15px", "sm", "sm"],
                            fontWeight: "heading",
                            lineHeight: 1,
                            textAlign: "center",
                          }}
                        >
                          {tab.label}
                        </Text>
                      </Button>
                    );
                  })}
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.55rem",
                    bg: "#eef3f5",
                    color: "#334155",
                    opacity: isFilteredView ? 1 : 0,
                    transform: isFilteredView
                      ? "translateY(0)"
                      : "translateY(8px)",
                    pointerEvents: isFilteredView ? "auto" : "none",
                    transition: "opacity 200ms ease, transform 200ms ease",
                  }}
                >
                  <FaCogs size={18} aria-hidden="true" />
                  <Text
                    as="span"
                    sx={{
                      fontSize: ["12px", "13px", "sm", "sm"],
                      fontWeight: "heading",
                    }}
                  >
                    Filtered Roles
                  </Text>
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  px: ["0.75rem", "0.9rem", "1rem"],
                  pt: ["0.75rem", "0.8rem", "0.9rem"],
                  pb: ["0.75rem", "0.75rem", "0.9rem"],
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                }}
              >
                {visibleRoles.length === 0 ? (
                  <Box
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      border: "1px dashed",
                      borderColor: "lightgray",
                      borderRadius: "12px",
                      bg: "rgba(0,0,0,0.01)",
                      px: "1rem",
                    }}
                  >
                    <Text sx={{ color: "darkgray", m: 0 }}>
                      No results found
                    </Text>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      display: "grid",
                      gridTemplateRows: `repeat(${PAGE_SIZE}, minmax(0, 1fr))`,
                      gap: "0.7rem",
                    }}
                  >
                    {paddedRoles.map((role, index) => {
                      if (!role) {
                        return (
                          <Box
                            key={`empty-role-${activeViewKey}-${index}`}
                            sx={{
                              borderRadius: "12px",
                              border: "1px dashed",
                              borderColor: "lightgray",
                              bg: "rgba(0,0,0,0.01)",
                            }}
                          />
                        );
                      }

                      const roleName = role?.name?.trim() || "Untitled role";
                      const descriptionText =
                        role?.description?.trim() ||
                        "No description available.";
                      const RolePresentationIcon =
                        getVolunteerRoleIconComponent(role?.icon);
                      const rolePresentationColor =
                        getVolunteerRolePresentationColor(role?.color);
                      const scopeMeta = getRoleScopeMeta(role?.roleScope);
                      const pointValue = Number(role?.pointValue);
                      const pointLabel = Number.isFinite(pointValue)
                        ? `${pointValue} pt${pointValue === 1 ? "" : "s"}`
                        : "-";
                      const pointPillMeta = isFilteredView
                        ? getSkillTabMeta(role?.pointValue)
                        : currentTab;

                      return (
                        <Box
                          key={role.id}
                          sx={{
                            position: "relative",
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: "black",
                            borderRadius: "12px",
                            p: ["0.75rem", "0.8rem", "0.9rem"],
                            pt: ["1.5rem", "1.55rem", "1.65rem"],
                            bg: "background",
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                          }}
                        >
                          <Box
                            as="span"
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: "16px",
                              backgroundColor:
                                rolePresentationColor || undefined,
                            }}
                          />

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: "0.75rem",
                              mb: "0.35rem",
                            }}
                          >
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                minWidth: 0,
                                flex: "1 1 auto",
                              }}
                            >
                              {RolePresentationIcon && (
                                <Box
                                  as="span"
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "999px",
                                    bg: rolePresentationColor || undefined,
                                    color: "white",
                                    flex: "0 0 24px",
                                  }}
                                >
                                  <RolePresentationIcon
                                    size={13}
                                    aria-hidden="true"
                                  />
                                </Box>
                              )}
                              <Heading
                                as="h3"
                                sx={{
                                  variant: "styles.h3",
                                  mt: 0,
                                  mb: 0,
                                  minWidth: 0,
                                  fontSize: ["1.2rem", "1.28rem", "1.36rem"],
                                  lineHeight: 1.2,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {roleName}
                              </Heading>
                            </Box>

                            <Box
                              as="span"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.28rem",
                                flex: "0 0 auto",
                                minWidth: "70px",
                                textAlign: "center",
                                px: "0.55rem",
                                py: "0.35rem",
                                borderRadius: "999px",
                                bg: pointPillMeta.bg,
                                color: pointPillMeta.accent,
                                fontWeight: "heading",
                                fontSize: "xs",
                                lineHeight: 1,
                                border: "1px solid black",
                              }}
                            >
                              <FaStar size={11} aria-hidden="true" />
                              {pointLabel}
                            </Box>
                            {scopeMeta && (
                              <Box
                                as="span"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "0.28rem",
                                  flex: "0 0 auto",
                                  textAlign: "center",
                                  px: "0.55rem",
                                  py: "0.35rem",
                                  borderRadius: "999px",
                                  bg: scopeMeta.bg,
                                  color: scopeMeta.color,
                                  fontWeight: "heading",
                                  fontSize: "xs",
                                  lineHeight: 1,
                                  border: "1px solid black",
                                }}
                              >
                                <scopeMeta.icon size={11} aria-hidden="true" />
                                {scopeMeta.label}
                              </Box>
                            )}
                          </Box>

                          <Box
                            sx={{
                              height: "1px",
                              backgroundColor: "lightgray",
                              mb: "0.45rem",
                            }}
                          />

                          <Text
                            sx={{
                              variant: "styles.p",
                              color: "text",
                              mb: 0,
                              fontSize: "0.95rem",
                              lineHeight: 1.35,
                              whiteSpace: "pre-line",
                              display: "-webkit-box",
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {descriptionText}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                <Box
                  sx={{
                    pt: "0.1rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.35rem",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    onClick={() =>
                      setPageForActiveTab(Math.max(1, safePage - 1))
                    }
                    disabled={safePage === 1}
                    sx={{
                      variant: "buttons.primary",
                      bg: safePage === 1 ? "lightgray" : "background",
                      color: safePage === 1 ? "darkgray" : "text",
                      border: "1px solid",
                      borderColor: "gray",
                      px: "0.75rem",
                      py: "0.3rem",
                      minWidth: "64px",
                      cursor: safePage === 1 ? "not-allowed" : "pointer",
                      "&:hover": {
                        bg: safePage === 1 ? "lightgray" : "highlight",
                        color: safePage === 1 ? "darkgray" : "text",
                      },
                    }}
                  >
                    Prev
                  </Button>

                  {paginationItems.map((item, index) => {
                    if (item.type === "ellipsis") {
                      return (
                        <Box
                          key={`roles-pagination-ellipsis-${item.key}-${index}`}
                          sx={{ px: "0.45rem", color: "gray", lineHeight: 1 }}
                        >
                          ...
                        </Box>
                      );
                    }

                    const isCurrent = item.value === safePage;
                    return (
                      <Button
                        key={`roles-pagination-number-${item.value}`}
                        onClick={() => setPageForActiveTab(item.value)}
                        sx={{
                          variant: "buttons.primary",
                          bg: isCurrent ? "primary" : "background",
                          color: isCurrent ? "white" : "text",
                          border: "1px solid",
                          borderColor: "gray",
                          px: "0.65rem",
                          py: "0.3rem",
                          minWidth: "38px",
                          "&:hover": {
                            bg: isCurrent ? "primary" : "highlight",
                            color: isCurrent ? "white" : "text",
                          },
                        }}
                      >
                        {item.value}
                      </Button>
                    );
                  })}

                  <Button
                    onClick={() =>
                      setPageForActiveTab(Math.min(totalPages, safePage + 1))
                    }
                    disabled={safePage === totalPages}
                    sx={{
                      variant: "buttons.primary",
                      bg: safePage === totalPages ? "lightgray" : "background",
                      color: safePage === totalPages ? "darkgray" : "text",
                      border: "1px solid",
                      borderColor: "gray",
                      px: "0.75rem",
                      py: "0.3rem",
                      minWidth: "64px",
                      cursor:
                        safePage === totalPages ? "not-allowed" : "pointer",
                      "&:hover": {
                        bg: safePage === totalPages ? "lightgray" : "highlight",
                        color: safePage === totalPages ? "darkgray" : "text",
                      },
                    }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </ContentContainer>
    </Layout>
  );
};

export default VolunteerRolesPage;
