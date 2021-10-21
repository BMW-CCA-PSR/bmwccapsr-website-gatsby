export default {
    name: 'tier',
    type: 'document',
    title: 'Tier',
    fields: [
      {
        name: 'title',
        type: 'string',
        title: 'Title'
      },
      {
        name: 'description',
        type: 'text',
        title: 'Description'
      },
      {
        name: 'rate',
        type: 'number',
        title: 'Rate',
        description: 'The cost per quarter for this tier'
      }
    ]
  }