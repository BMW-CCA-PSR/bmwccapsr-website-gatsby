export default {
    type: 'object',
    name: 'hero',
    title: 'Hero',
    fields: [
      {
        name: 'label',
        type: 'string'
      },
      {
        name: 'heading',
        type: 'string',
        title: 'Heading'
      },
      {
        name: 'tagline',
        type: 'simpleBlockContent'
      },
      {
        name: 'illustration',
        type: 'illustration'
      },
      {
        name: 'cta',
        type: 'cta'
      }
    ],
    preview: {
      select: {
        title: 'heading',
        subtitle: 'label',
        disabled: 'disabled',
        image: 'illustration'
      },
      prepare({ title, disabled, image }) {
        return !image ? 
          { 
            title: `Hero: ${disabled ? 'DISABLED' : title}` 
          } : {
            title: `Hero: ${disabled ? 'DISABLED' : title}`,
            media: image.image
          }
      }
    }
  }