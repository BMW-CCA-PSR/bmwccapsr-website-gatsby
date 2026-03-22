import { buildUniqueFieldValidator } from '../utils/uniqueFieldValidation';

export default {
  name: 'author',
  type: 'document',
  title: 'Author',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Name',
      validation: Rule => Rule
        .error('You must select an author name.')
        .required()
        .custom(buildUniqueFieldValidator({
          typeName: 'author',
          fieldPath: 'name',
          label: 'Author name',
        })),

    },
    // {
    //   name: 'slug',
    //   type: 'slug',
    //   title: 'Slug',
    //   description: 'Some frontends will require a slug to be set to be able to show the person',
    //   options: {
    //     source: 'name',
    //     maxLength: 96
    //   }
    // },
    {
      name: 'image',
      type: 'mainImage',
      title: 'Image',
      description: 'Author avatar image. If left empty, a default grey silhouette will be used.',
      validation: Rule => Rule.warning('Author image is recommended for a better look.'),
    },
    {
      name: 'bio',
      type: 'simpleBlockContent',
      title: 'Biography'
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'slug.current',
      media: 'image'
    }
  }
}