import { GoBrowser } from "react-icons/go";

const isJoinPage = (document) =>
  document?._id === 'join' || document?._id === 'drafts.join'

export default {
  type: 'document',
  name: 'page',
  title: 'Page',
  icon: GoBrowser,
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
    },
    {
      name: 'content',
      type: 'array',
      title: 'Page sections',
      description: 'Add, edit, and reorder sections',
      hidden: ({ document }) => isJoinPage(document),
      of: [
        { type: 'uiComponentRef' },
        { type: 'hero' },
        { type: 'heroCarousel' },
        { type: 'ctaPlug' },
        { type: 'topStories' },
        { type: 'zundfolgeLatest' },
        { type: 'upcomingEvents' },
        { type: 'homepageSponsors' },
        { type: 'headerBar' },
        { type: 'pageContent' },
        { type: 'advertisement' }
      ],
    },
    {
      name: 'joinHero',
      type: 'joinHero',
      title: 'Hero',
      hidden: ({ document }) => !isJoinPage(document)
    },
    {
      name: 'joinHpdeSection',
      type: 'joinEventSection',
      title: 'Driver Education Section',
      hidden: ({ document }) => !isJoinPage(document)
    },
    {
      name: 'joinEventHighlightsIntro',
      type: 'text',
      title: 'Event Highlights Intro',
      rows: 3,
      hidden: ({ document }) => !isJoinPage(document)
    },
    {
      name: 'joinSocialSection',
      type: 'joinEventSection',
      title: 'Social Section',
      hidden: ({ document }) => !isJoinPage(document)
    },
    {
      name: 'joinBenefitsIntro',
      type: 'text',
      title: 'Benefits Intro',
      rows: 3,
      hidden: ({ document }) => !isJoinPage(document)
    },
    {
      name: 'joinBenefitsPrimary',
      type: 'array',
      title: 'Benefits (Group 1)',
      description: 'Up to 5 items.',
      of: [{ type: 'joinBenefitItem' }],
      validation: (Rule) => Rule.max(5),
      hidden: ({ document }) => !isJoinPage(document)
    },
    {
      name: 'joinBenefitsSecondary',
      type: 'array',
      title: 'Benefits (Group 2)',
      description: 'Up to 5 items.',
      of: [{ type: 'joinBenefitItem' }],
      validation: (Rule) => Rule.max(5),
      hidden: ({ document }) => !isJoinPage(document)
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({title}) {
      return {
        title: title || 'Untitled page',
        media: GoBrowser
      }
    }
  }
}
  
