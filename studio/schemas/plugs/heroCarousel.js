export default {
    type: 'object',
    name: 'heroCarousel',
    fields: [
      {
        type: 'string',
        name: 'title'
      },
      {
        type: 'array',
        name: 'slides',
        of: [
          { type: 'hero' },
          { type: 'illustration' }
        ]
      }
    ]
  }