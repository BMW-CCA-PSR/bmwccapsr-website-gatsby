import { GoFileSymlinkFile } from 'react-icons/go'

const NAV_LINK_ICON_OPTIONS = [
  { title: 'Car', value: 'car' },
  { title: 'Road / Route', value: 'route' },
  { title: 'Map Pin', value: 'map-pin' },
  { title: 'Calendar', value: 'calendar' },
  { title: 'Users / Community', value: 'users' },
  { title: 'Meetup / Social', value: 'social' },
  { title: 'Tech / Tools', value: 'tools' },
  { title: 'Wrench', value: 'wrench' },
  { title: 'Flag / Motorsport', value: 'flag' },
  { title: 'Education / Book', value: 'book' },
  { title: 'Trophy', value: 'trophy' },
  { title: 'News / Article', value: 'news' },
  { title: 'Volunteer / Helping Hands', value: 'volunteer' },
  { title: 'Info', value: 'info' },
  { title: 'Star', value: 'star' }
]

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
        title: 'Description (optional)',
        name: 'description',
        type: 'string'
      },
      {
        title: 'Image (optional)',
        name: 'image',
        type: 'image',
        options: {
          hotspot: true
        }
      },
      {
        title: 'Icon (optional)',
        name: 'icon',
        type: 'string',
        options: {
          list: NAV_LINK_ICON_OPTIONS
        }
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
        link: 'href',
        image: 'image'
      },
      prepare ({title, landingPage, route, link, image}) {
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
          subtitle,
          media: image
        }
      }
    }
  }
