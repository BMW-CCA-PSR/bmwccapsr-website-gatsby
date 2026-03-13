// document schemas
import navMenu from './documents/navMenu'
import author from './documents/author'
import category from './documents/category'
import post from './documents/post'
import page from './documents/page'
import siteSettings from './documents/siteSettings'
import route from './documents/route'
import event from './documents/event'
import eventCategory from './documents/eventCategory'
import tier from './documents/tier'
import advertiser from './documents/advertiser'
import advertiserCategory from './documents/advertiserCategory'
import volunteerRole from './documents/volunteerRole'
import volunteerCategory from './documents/volunteerCategory'
import volunteerFixedRole from './documents/volunteerFixedRole'
import volunteerApplication from './documents/volunteerApplication'
import workflow from './documents/workflow'

// Object types
import pdfUpload from './objects/pdfUpload'
import { videoEmbed } from './objects/embeds'
import cta from './objects/cta'
import bodyPortableText from './objects/bodyPortableText'
import excerptPortableText from './objects/excerptPortableText'
import mainImage from './objects/mainImage'
import authorReference from './objects/authorReference'
import link from './objects/link'
import variation from './objects/variation'
import openGraph from './objects/openGraph'
import navItem from './objects/navItem'
import address from './objects/address'
import poc from './objects/poc'
import hero from './objects/hero'
import simpleBlockContent from './objects/simpleBlockContent'
import advertisement from './objects/advertisement'
import otherStories from './objects/otherStories'
import upcomingEvents from './objects/upcomingEvents'
import article from './objects/article'
import ctaPlug from './objects/ctaPlug'
import headerBar from './objects/headerBar'
import topStories from './objects/topStories'
import zundfolgeLatest from './objects/zundfolgeLatest'
import pageContent from './objects/pageContent'
import uiComponent from './objects/uiComponent'
import homepageSponsors from './objects/homepageSponsors'
import heroCarousel from './objects/heroCarousel'
import joinEventItem from './objects/joinEventItem'
import joinEventSection from './objects/joinEventSection'
import joinBenefitItem from './objects/joinBenefitItem'
import joinHero from './objects/joinHero'
import motorsportRegEvent from './objects/motorsportRegEvent'

export default [
    variation,
    openGraph,
    route,
    link,
    simpleBlockContent,
    cta,
    siteSettings,
    post,
    navMenu,
    page,
    category,
    author,
    mainImage,
    authorReference,
    videoEmbed,
    bodyPortableText,
    excerptPortableText,
    navItem,
    event,
    eventCategory,
    tier,
    advertiser,
    advertiserCategory,
    volunteerRole,
    volunteerFixedRole,
    volunteerApplication,
    volunteerCategory,
    address,
    workflow,
    poc,
    hero,
    advertisement,
    otherStories,
    upcomingEvents,
    article,
    ctaPlug,
    headerBar,
    topStories,
    zundfolgeLatest,
    pageContent,
    uiComponent,
    homepageSponsors,
    heroCarousel,
    joinEventItem,
    joinEventSection,
    joinBenefitItem,
    joinHero,
    pdfUpload,
    motorsportRegEvent
]
