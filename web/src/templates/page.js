/** @jsxImportSource theme-ui */
import React from "react";
import { graphql } from "gatsby";

import Hero from "../components/hero";
import Cta from "../components/cta";

import GraphQLErrorList from "../components/graphql-error-list";
import Seo from "../components/seo";
import Layout from "../containers/layout";
import HeroSlider from "../components/slider";
import ZundfolgeLatest from "../components/zundfolge-latest";
import UpcomingEvents from "../components/upcoming-events";
import EventSlider from "../components/event-slider";
import HomepageSponsors from "../components/home-page-sponsors";
import { BannerAd, BoxAd } from "../components/ads";
import { getZundfolgeUrl, randomGenerator, toPlainText } from "../lib/helpers";
import BoxHeader from '../components/BoxHeader';
import PortableText from '../components/portableText';
import ContentContainer from "../components/content-container";
 
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
    const isFrontpage =
      page && (page._id === "frontpage" || page._id === "drafts.frontpage");
    const post = data.post
    const event = data.event
    const ads = data.ads
    const banners = data.banners
    const boxes = data.boxes
    const slideAds = data.slideAds
    const featuredNode = data.featuredPost?.edges?.[0]?.node || null
    const featuredTaglineBase = featuredNode?._rawExcerpt
      ? toPlainText(featuredNode._rawExcerpt)
      : ""
    const featuredTagline = featuredTaglineBase
      ? `${featuredTaglineBase.slice(0, 120).trim()}${featuredTaglineBase.length > 120 ? "..." : ""}`
      : "Discover the latest featured Zundfolge article."
    const featuredHeroSlides = isFrontpage && featuredNode
      ? [
          {
            _key: `featured-${featuredNode.id}`,
            _type: "hero",
            label: "Featured Story",
            heading: featuredNode.title,
            tagline: featuredTagline,
            colors: "#FFFFFF",
            image: featuredNode.mainImage,
            cta: {
              title: "Read Story",
              route: getZundfolgeUrl(featuredNode.slug.current)
            }
          }
        ]
      : []
    const content = (page._rawContent || [])
      .filter((c) => !c.disabled)
      .map((c, index) => {
        const contentKey = c?._key || `${c?._type || "content"}-${index}`;
        let el = null;
        switch (c._type) {
          case "hero":
            el = <Hero key={contentKey} {...c} isHomepage={isFrontpage} />;
            break;
          case "ctaPlug":
            el = <Cta key={contentKey} {...c} />;
            break;
          case "heroCarousel":
            el = (
              <HeroSlider
                key={contentKey}
                {...c}
                {...slideAds}
                featuredSlides={featuredHeroSlides}
                isHomepage={isFrontpage}
              />
            );
            break;
          case "topStories":
          case "zundfolgeLatest":
            el = <ZundfolgeLatest key={contentKey} {...c} {...post} />;
            break;
          case "upcomingEvents":
            el = <UpcomingEvents key={contentKey} {...c} {...event} />;
            break;
          case "homepageSponsors":
            el = <HomepageSponsors key={contentKey} {...c} {...ads} />;
            break;
          case "headerBar":
            el = <BoxHeader key={contentKey} title={c.title} />;
            break;
          case "advertisement":
            const adType = c.type ? c.type === "banner" ? banners : boxes : null
            if(adType && adType.edges){
              const randomAdPosition = randomGenerator(0, adType.edges.length - 1)
              const randomizedAd = adType.edges.length > 0 ? adType.edges[randomAdPosition].node : null
              el = c.type === "banner" && randomizedAd ? <BannerAd key={contentKey} {...randomizedAd} /> : <BoxAd key={contentKey} {...randomizedAd} />
            }
            break;
          case "pageContent":
            el = (
              <ContentContainer
                key={contentKey}
                sx={{
                  mx: "auto",
                  my: "20px",
                  px: ["16px", "16px", "50px", "100px"],
                  width: "100%",
                }}
              >
                <PortableText {...c} color={"text"} boxed />
              </ContentContainer>
            );
            break;
          case "uiComponentRef":
            switch (c.name) {
              case "event-slider":
                el = <EventSlider key={contentKey} {...c} {...event} />;
                break;
              case "banner-ad":
                const randomAdPosition = randomGenerator(0, banners.edges.length - 1)
                const randomizedAd = banners.edges.length > 0 ? banners.edges[randomAdPosition].node : null
                el = randomizedAd ? <BannerAd key={contentKey} {...randomizedAd} /> : null;
                break;
              default:
                break;
            }
            break;
          default:
            el = null;
        }
        if (!el) {
          return null;
        }

        return <React.Fragment key={contentKey}>{el}</React.Fragment>;
      });
    const menuItems = site.navMenu && (site.navMenu.items || []);
    const pageTitle = data.route && !data.route.useSiteTitle && page.title;
    const seoTitle = pageTitle || site.title || "BMW CCA Puget Sound Region";

    return (
      <Layout navMenuItems={menuItems}>
        <Seo
          title={seoTitle}
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
