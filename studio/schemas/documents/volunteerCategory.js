export default {
    name: 'volunteerCategory',
    type: 'document',
    title: 'Volunteer Category',
    fields: [
      {
        name: 'title',
        type: 'string',
        title: 'Title',
        validation: Rule => Rule.required()
      },
      {
        name: 'description',
        type: 'text',
        title: 'Description'
      }
    ]
  }
