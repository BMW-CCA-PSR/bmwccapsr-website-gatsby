export default {
    type: 'object',
    name: 'topStories',
    title: 'Top Stories',
    fields: [
      {
        type: 'string',
        name: 'title',
        validation: Rule => Rule.required(),
      }
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