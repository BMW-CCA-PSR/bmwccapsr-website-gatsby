export default {
    type: 'object',
    name: 'pageContent',
    title: 'Page Content',
    fields: [
      {
        type: 'string',
        name: 'title',
        validation: Rule => Rule.required(),
      },
      {
        type: 'bodyPortableText',
        name: 'body',
      },
    ],
    preview: {
        select: {
          title: 'title'
        },
        prepare({ title }) {
          return {
            title: `Page Content: ${disabled ? 'DISABLED' : title}` 
          }
        }
      }
    }