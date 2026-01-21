export default {
  name: 'joinEventSection',
  title: 'Join Page Event Section',
  type: 'object',
  fields: [
    {
      name: 'heading',
      title: 'Heading',
      type: 'string'
    },
    {
      name: 'subheading',
      title: 'Subheading',
      type: 'simpleBlockContent',
      description: 'Use this if you need bold or italic text.'
    },
    {
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [{ type: 'joinEventItem' }]
    },
    {
      name: 'subtext',
      title: 'Subtext',
      type: 'string',
      description: 'Optional small-note line (e.g. * asterisk note).'
    },
    {
      name: 'columns',
      title: 'Columns',
      type: 'number',
      description: 'Desktop column count for the list (1 or 2).',
      validation: (Rule) => Rule.min(1).max(2)
    }
  ]
}
