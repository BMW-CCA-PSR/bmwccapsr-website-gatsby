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
        title: 'Heading',
        validation: Rule => Rule.max(60).error(`A title shouldn't be more than 60 characters.`)
      },
      {
        name: 'tagline',
        type: 'string',
        title: 'Tagline',
        validation: Rule => Rule.max(60).error(`A tagline shouldn't be more than 60 characters.`)
      },
      {
        name: 'image',
        type: 'mainImage',
        validation: Rule => Rule.required(),
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
        image: 'image'
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