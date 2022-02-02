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
          type: 'type'
        },
        prepare({ type }) {
          return {
            title: disabled ? 'DISABLED' : type ? `Advertisement: ${type}` : `Advertisement`
          }
        }
      }
    }