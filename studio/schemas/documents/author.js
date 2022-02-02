export default {
  name: 'author',
  type: 'document',
  title: 'Author',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Name',
      validation: Rule => Rule.error('You must select an author name.').required(),

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
      validation: Rule => Rule.error('You must select an author image.').required(),
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