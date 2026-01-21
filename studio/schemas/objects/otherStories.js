export default {
    type: 'object',
    name: 'otherStories',
    title: 'DEPRECATED - otherStories',
    hidden: true,
    fields: [
      {
        type: 'string',
        name: 'title',
        validation: Rule => Rule.required(),
      },
      {
        type: 'number',
        name: 'limit',
        initialValue: 3,
        options: {
            list: [4, 6, 8, 12]
        }
      },
    ],
    preview: {
        select: {
          title: 'title',
          limit: 'limit'
        },
        prepare({ title, limit }) {
          return {
            title: title,
            subtitle: `Limit: ${limit}`
          }
        }
      }
    }
