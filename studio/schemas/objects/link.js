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
        title: 'Path',
        name: 'route',
        fieldset: 'link',
        description: 'Example: /zundfolge',
        type: 'string'
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
        route: 'route',
        link: 'href'
      },
      prepare ({title, landingPage, route, link}) {
        const normalizedRoute = route
          ? (route.startsWith('/') ? route : `/${route}`)
          : null

        let subtitle = 'No destination set'
        if (landingPage) {
          subtitle = `Route: /${landingPage}`
        } else if (normalizedRoute) {
          subtitle = `Path: ${normalizedRoute}`
        } else if (link) {
          subtitle = `External: ${link}`
        }

        const previewTitle = title || normalizedRoute || (landingPage ? `/${landingPage}` : link) || 'Untitled link'

        return {
          title: previewTitle,
          subtitle
        }
      }
    }
  }
