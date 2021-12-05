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
import HeroSlider from "../components/slider";
import TopStories from "../components/topStories";
import OtherStories from "../components/other-stories";
import EventSlider from "../components/event-slider";
import HomepageSponsors from "../components/home-page-sponsors";
import { BannerAd } from "../components/ads";
import { randomGenerator } from "../lib/helpers"

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
    ads: allSanityAdvertiser(filter: {active: {eq: true}}) {
      edges {
        node {
          _rawBanner(resolveReferences: {maxDepth: 10})
          _rawBox(resolveReferences: {maxDepth: 10})
          category {
            title
          }
          tier {
            title
          }
          _rawLogo(resolveReferences: {maxDepth: 10})
          name
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
    const post = data.post
    const event = data.event
    const ads = data.ads
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
          case "heroCarousel":
            el = <HeroSlider key={c._key} {...c} />;
            break;
          case "topStories":
            el = <TopStories key={c._key} {...c} {...post} />;
            break;
          case "otherStories":
            el = <OtherStories key={c._key} {...c} {...post} />;
            break;
          case "homepageSponsors":
            el = <HomepageSponsors key={c._key} {...c} {...ads} />;
            break;
          case "uiComponentRef":
            switch (c.name) {
              case "event-slider":
                el = <EventSlider key={c._key} {...c} {...event} />;
                break;
              case "banner-ad":
                const randomAdPosition = randomGenerator(0, ads.edges.length - 1)
                const randomizedAd = ads.edges[randomAdPosition].node
                el = <BannerAd {...randomizedAd} />;
                break;
              default:
                break;
            }
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