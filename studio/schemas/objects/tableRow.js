export default {
  name: 'tableRow',
  title: 'Table Row',
  type: 'object',
  fields: [
    {
      name: 'cells',
      title: 'Cells',
      type: 'array',
      of: [{ type: 'string' }],
    },
  ],
  preview: {
    select: { cells: 'cells' },
    prepare({ cells = [] }) {
      return { title: cells.join(' | ') || 'Empty row' }
    },
  },
}
