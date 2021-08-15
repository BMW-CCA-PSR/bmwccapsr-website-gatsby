export default {
    type: 'object',
    name: 'link',
    title: 'URL',
    fields: [
      {
        title: 'External URL',
        description:'Use fully qualified URLS for external link',
        name: 'href',
        type: 'url'
      },
      {
      title: 'Internal Link',
      name: 'internalLink',
      description: 'Select pages for navigation',
      type: 'reference',
      to: [{ type: 'page' },{ type: 'post' }], 
      },
    ]
  }