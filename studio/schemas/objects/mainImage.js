export default {
    name: 'mainImage',
    type: 'image',
    title: 'Image',
    options: {
      hotspot: true,
      metadata: ['lqip', 'palette']
    },
    fields: [
      {
        name: 'caption',
        type: 'string',
        title: 'Caption',
        options: {
          isHighlighted: true
        }
      },
      {
        name: 'alt',
        type: 'string',
        title: 'Alternative text',
        description: 'Important for SEO and accessibility.',
        validation: Rule => Rule.required(),
        options: {
          isHighlighted: true
        }
      }
    ],
    preview: {
      select: {
        imageUrl: 'asset.url',
        title: 'caption'
      }
    }
  }