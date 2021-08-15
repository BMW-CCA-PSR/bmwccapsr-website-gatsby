import { GoFileSymlinkFile } from 'react-icons/go'

export default {
    title: 'Link',
    name: 'link',
    type: 'object',
    icon: GoFileSymlinkFile,
    fieldsets: [
      {
        title: 'Link',
        name: 'link',
        description: 'Only the first value of these will be used'
      }
    ],
    fields: [
      {
        title: 'Title',
        name: 'title',
        type: 'string'
      },
      {
        title: 'Landing page',
        name: 'landingPageRoute',
        type: 'reference',
        fieldset: 'link',
        to: [{type: 'route'}]
      },

      {
        title: 'External link',
        description: 'Example: https://www.sanity.io',
        name: 'href',
        fieldset: 'link',
        type: 'url'
      },
    ],
    preview: {
      select: {
        title: 'title',
        landingPage: 'landingPageRoute.slug.current',
        link: 'href'
      },
      prepare ({title, landingPage, link}) {
        let subtitle = 'Not set'
        if (landingPage) {
          subtitle = `Route: /${landingPage}`
        }
        if (link) {
          subtitle = `External: ${link}`
        }
        return {
          title,
          subtitle
        }
      }
    }
  }