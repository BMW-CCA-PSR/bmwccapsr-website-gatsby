export default {
    type: 'object',
    name: 'topStories',
    title: 'Top Stories',
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
            list: [1, 2, 3, 4, 5]
        }
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