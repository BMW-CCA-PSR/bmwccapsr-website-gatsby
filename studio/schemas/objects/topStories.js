export default {
    type: 'object',
    name: 'topStories',
    title: 'DEPRECATED - topStories',
    hidden: true,
    fields: [
      {
        type: 'string',
        name: 'title',
        hidden: true,
        initialValue: 'Zundfolge'
      }
    ],
    preview: {
        select: {
          title: 'title'
        },
        prepare({ title }) {
          return {
            title: title || 'Zundfolge'
          }
        }
      }
    }
