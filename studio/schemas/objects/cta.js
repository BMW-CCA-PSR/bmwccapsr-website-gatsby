import { MdAnnouncement } from 'react-icons/md'

export default {
    title: 'Call to action',
    name: 'cta',
    type: 'object',
    icon: MdAnnouncement,
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
        type: 'string',
        validation: Rule => Rule.max(32).error(`A cta title cannot exceed 32 characters.`)
      },
      {
        title: 'Internal Landing page',
        name: 'landingPageRoute',
        type: 'reference',
        description: 'Only for links to Internal dynamic pages',
        fieldset: 'link',
        to: [{type: 'route'}]
      },
      {
        title: 'Internal Path',
        name: 'route',
        fieldset: 'link',
        description: 'Example: /zundfolge -- Only for links to Internal static pages',
        type: 'string'
      },
      {
        title: 'External link',
        name: 'link',
        type: 'string',
        description: 'Example: https://www.sanity.io -- Only for links to External pages',
        fieldset: 'link'
      },
    ],
    preview: {
      select: {
        title: 'title',
        landingPage: 'landingPageRoute.slug.current',
        route: 'route',
        link: 'link'
      },
      prepare ({title, landingPage, route, link}) {
        let subtitle = 'Not set'
        if (landingPage) {
          subtitle = `Route: /${landingPage}`
        }
        if (route) {
          subtitle = `Route: ${route}`
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