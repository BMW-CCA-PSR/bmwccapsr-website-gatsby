/** @jsxImportSource theme-ui */
import React, { useState } from "react";
import { graphql } from "gatsby";
import { Flex } from '@theme-ui/components';

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
import { BannerAd, BoxAd } from "../components/ads";
import { randomGenerator } from "../lib/helpers";
import BoxHeader from '../components/BoxHeader';
import PortableText from '../components/portableText';
 
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

function Page(props) {
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
    const banners = data.banners
    const boxes = data.boxes
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
          case "headerBar":
            el = <BoxHeader key={c._key} title={c.title} />;
            break;
          case "advertisement":
            const adType = c.type ? c.type == "banner" ? banners : boxes : null
            if(adType && adType.edges){
              const randomAdPosition = randomGenerator(0, adType.edges.length - 1)
              const randomizedAd = adType.edges.length > 0 ? adType.edges[randomAdPosition].node : null
              el = c.type == "banner" && randomizedAd ? <BannerAd {...randomizedAd} /> : <BoxAd {...randomizedAd} />
            }
            break;
          case "pageContent":
            el = <Flex sx={{
              mx: "auto",
              my: "20px",
              px: ["16px","16px","50px","100px"],
              }}>
                <PortableText key={c._key} {...c} color={'text'} />
              </Flex>
            break;
          case "uiComponentRef":
            switch (c.name) {
              case "event-slider":
                el = <EventSlider key={c._key} {...c} {...event} />;
                break;
              case "banner-ad":
                const randomAdPosition = randomGenerator(0, banners.edges.length - 1)
                const randomizedAd = banners.edges.length > 0 ? banners.edges[randomAdPosition].node : null
                el = randomizedAd ? <BannerAd {...randomizedAd} /> : null;
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

  Page.defaultProps = {
    banners: 
      {
        edges: [
          {
            node: ''
          }
        ]
      }
  };
  
  
  export default Page;