export default {
    type: 'object',
    name: 'headerBar',
    title: 'Section Header',
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
            title: `Section Header: ${title ? title : ''}` 
          }
        }
      }
    }