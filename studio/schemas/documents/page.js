export default {
    type: 'document',
    name: 'page',
    title: 'Page',
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
        of: [
          { type: 'uiComponentRef' },
          { type: 'hero' },
          { type: 'heroCarousel' },
          { type: 'ctaPlug' },
          { type: 'topStories' },
          { type: 'otherStories' },
          { type: 'homepageSponsors' },
          { type: 'headerBar' },
          { type: 'pageContent' },
          { type: 'advertisement' }
        ],
      },
    ],
  }
  