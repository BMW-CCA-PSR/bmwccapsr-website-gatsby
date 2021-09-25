export default {
    type: 'object',
    name: 'illustration',
    title: 'Illustration',
    fields: [
      {
        title: 'Image',
        name: 'image',
        type: 'mainImage',
          options: {
            metadata: ['palette']
          }
      }
    ],
    preview: {
      select: {
        image: 'image'
      },
      prepare({ image }) {
        if (!image) {
          return { title: 'Illustration with no image' }
        }
        return {
          title: `Illustration`,
          subtitle: `${image.caption ||
            image.alt ||
            'Missing capton or alt text'} | Size: ${image.size || 'default'}`,
          media: image
        }
      }
    }
  }