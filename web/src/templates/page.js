/** @jsxImportSource theme-ui */
import React, { useState } from "react";
import { graphql } from "gatsby";

import Hero from "../components/hero";
import InfoRows from "../components/InfoRows";
import CTAColumns from "../components/cta-columns";
import Cta from "../components/cta";

import GraphQLErrorList from "../components/graphql-error-list";
import Seo from "../components/seo";
import Layout from "../containers/layout";

export const query = graphql`
  query PageTemplateQuery($id: String!) {
    route: sanityRoute(id: { eq: $id }) {
      slug {
        current
      }
      useSiteTitle
      page {
        ...PageInfo
      }
    }
    site: sanitySiteSettings(_id: { regex: "/(drafts.|)siteSettings/" }) {
      title
      navMenu {
        ...NavMenu
      }
      openGraph {
        title
        description
        image {
          ...SanityImage
        }
      }
    }
  }
`;

const Page = (props) => {
    const { data, errors } = props;
    if (errors) {
      return (
        <Layout>
          <GraphQLErrorList errors={errors} />
        </Layout>
      );
    }
  
    const site = (data || {}).site;

    if (!site) {
      throw new Error(
        'Missing "Site settings". Open the studio at http://localhost:3333 and add some content to "Site settings" and restart the development server.'
      );
    }

    const page = data.page || data.route.page;

    const content = (page._rawContent || [])
      .filter((c) => !c.disabled)
      .map((c) => {
        let el = null;
        switch (c._type) {
          case "infoRows":
            el = <InfoRows key={c._key} {...c} />;
            break;
          case "hero":
            el = <Hero key={c._key} {...c} />;
            break;
          case "ctaColumns":
            el = <CTAColumns key={c._key} {...c} />;
            break;
          case "ctaPlug":
            el = <Cta key={c._key} {...c} />;
            break;
          default:
            el = null;
        }
        return el;
      });

    const menuItems = site.navMenu && (site.navMenu.items || []);
    const pageTitle = data.route && !data.route.useSiteTitle && page.title;

    return (
      <Layout navMenuItems={menuItems}>
        <Seo
          title={pageTitle}
          description={site.description}
          keywords={site.keywords}
        />
        <div>{content}</div>
      </Layout>
    );
  };
  
  export default Page;