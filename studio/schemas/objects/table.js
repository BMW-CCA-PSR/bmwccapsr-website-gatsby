export default {
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'hasHeaderRow',
      title: 'First row is header',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [{ type: 'tableRow' }],
    },
  ],
  preview: {
    select: { rows: 'rows', caption: 'caption' },
    prepare({ rows = [], caption }) {
      return {
        title: caption || 'Table',
        subtitle: `${rows.length} row${rows.length !== 1 ? 's' : ''}`,
      }
    },
  },
}
