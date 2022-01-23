export default {
    type: 'object',
    name: 'textWithIllustration',
    title: 'Text with Illustration',
    fields: [
      {
        type: 'string',
        name: 'title'
      },
      {
        type: 'simpleBlockContent',
        name: 'text'
      },
      {
        type: 'illustration',
        name: 'illustration'
      }
    ]
  }