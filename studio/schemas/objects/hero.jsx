import ColorSelector, { colorHexValidator } from '../../src/components/colorSelector';

export default {
    type: 'object',
    name: 'hero',
    title: 'Hero',
    fields: [
      {
        name: 'label',
        type: 'string',
        validation: Rule => Rule.max(16).error(`A label cannot exceed 16 characters.`)
      },
      {
        name: 'heading',
        type: 'string',
        title: 'Heading',
        validation: Rule => Rule.max(64).error(`A title cannot exceed 64 characters.`)
      },
      {
        name: 'tagline',
        type: 'string',
        title: 'Tagline',
        validation: Rule => Rule.max(32).error(`A tagline cannot exceed 32 characters.`)
      },
      {
        title: "Text Color Override", // currently broken from v3
        description: "Optional text color override",
        name: "colors",
        type: "string",
        components: {
          input: props => (
            <ColorSelector
              {...props}
              withColorNames
              list={[
                { title: 'Black', value: '#000000' },
                { title: 'White', value: '#FFFFFF' },
              ]}
            />
          ),
        },
        validation: Rule => Rule.custom(colorHexValidator),
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