export default {
    type: 'document',
    name: 'navigationMenu',
    title: 'Navigation Menu',
    fields: [
      {
        type: 'string',
        name: 'title'
      },
      {
        type: 'array',
        name: 'items',
        of: [
          { type: 'navigationItem' },
          { type: 'link'},
        ]
      }
    ]
  }