// document schemas
import navMenu from './documents/navMenu'
import author from './documents/author'
import category from './documents/category'
import post from './documents/post'
import zundfolgeIssue from './documents/zundfolgeIssue'
import page from './documents/page'
import siteSettings from './documents/siteSettings'
import route from './documents/route'
import event from './documents/event'
import eventCategory from './documents/eventCategory'
import sourceSettings from './documents/sourceSettings'
import tier from './documents/tier'
import advertiser from './documents/advertiser'
import advertiserCategory from './documents/advertiserCategory'
import volunteerRole from './documents/volunteerRole'
import volunteerCategory from './documents/volunteerCategory'
import volunteerFixedRole from './documents/volunteerFixedRole'
import volunteerApplication from './documents/volunteerApplication'
import workflow from './documents/workflow'
import emailAlias from './documents/emailAlias'
import emailAliasType from './documents/emailAliasType'
import emailSendingSettings from './documents/emailSendingSettings'
import volunteerOverviewPageSettings from './documents/volunteerOverviewPageSettings'
import volunteerRewardsPageSettings from './documents/volunteerRewardsPageSettings'
import volunteerRolesPageSettings from './documents/volunteerRolesPageSettings'
import volunteerApplicationLifecycleSettings from './documents/volunteerApplicationLifecycleSettings'

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
import recentSyncRun from './objects/recentSyncRun'
import table from './objects/table'
import tableRow from './objects/tableRow'
import emailAliasAddressRecipient from './objects/emailAliasAddressRecipient'
import emailAliasReferenceRecipient from './objects/emailAliasReferenceRecipient'
import volunteerOverviewCard from './objects/volunteerOverviewCard'
import volunteerRewardLevel from './objects/volunteerRewardLevel'
import volunteerRewardFaq from './objects/volunteerRewardFaq'

export default [
    variation,
    openGraph,
    route,
    link,
    simpleBlockContent,
    cta,
    siteSettings,
    post,
    zundfolgeIssue,
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
    sourceSettings,
    tier,
    advertiser,
    advertiserCategory,
    volunteerRole,
    volunteerFixedRole,
    volunteerApplication,
    volunteerCategory,
    address,
    workflow,
    emailAlias,
    emailAliasType,
    emailSendingSettings,
    volunteerOverviewPageSettings,
    volunteerRewardsPageSettings,
    volunteerRolesPageSettings,
    volunteerApplicationLifecycleSettings,
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
    motorsportRegEvent,
    recentSyncRun,
    table,
    tableRow,
    emailAliasAddressRecipient,
    emailAliasReferenceRecipient,
    volunteerOverviewCard,
    volunteerRewardLevel,
    volunteerRewardFaq,
]
