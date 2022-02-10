export default {
    type: 'object',
    name: 'advertisement',
    title: 'Advertisement',
    fields: [
      {
        type: 'string',
        name: 'title',
      },
      {
        title: 'Type',
        name: 'type',
        type: 'string',
        options: {
          list: [
            { "title": "Banner", "value": "banner"},
            { "title": "Box", "value": "box"},
          ],
        }
    },
    ],
    preview: {
        select: {
          type: 'type',
          title: 'title'
        },
        prepare({ title, type }) {
          return {
            title: type ? `Advertisement: ${type}` : `Advertisement`,
            subtitle: title ? title : ''
          }
        }
      }
    }