export default {
    type: 'object',
    name: 'homepageSponsors',
    title: 'Homepage Sponsors',
    fields: [
      {
        type: 'string',
        name: 'title',
        validation: Rule => Rule.required(),
      },
    ],
    preview: {
        select: {
          title: 'title'
        },
        prepare({ title }) {
          return {
            title: title
          }
        }
      }
    }