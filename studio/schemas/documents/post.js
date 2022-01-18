export default {
    name: 'post',
    type: 'document',
    title: 'Blog Post',
    fields: [
      {
        name: 'title',
        type: 'string',
        title: 'Title',
        description: 'Titles should be catchy, descriptive, and not too long',
      },
      {
        name: 'slug',
        type: 'slug',
        title: 'Slug',
        description: 'The unique address that the article will live at. (e.g. "/zundfolge/your-article")',
        options: {
          source: 'title',
          maxLength: 96,
        },
      },
      {
        name: 'publishedAt',
        type: 'datetime',
        title: 'Published at',
        description: 'This can be used to schedule post for publishing',
      },
      {
        name: 'mainImage',
        type: 'mainImage',
        title: 'Main image',
      },
      {
        name: 'excerpt',
        type: 'excerptPortableText',
        title: 'Excerpt',
        description:
          'This ends up on summary pages, on Google, when people share the article in social media.',
      },
      {
        name: 'authors',
        title: 'Authors',
        type: 'array',
        validation: Rule => Rule.error('You have to select an author.').required().min(1),
        options: {
          isHighlighted: true
        },
        of: [
          {
            type: 'authorReference',
          },
        ],
      },
      {
        name: 'categories',
        type: 'array',
        title: 'Categories',
        of: [
          {
            type: 'reference',
            to: {
              type: 'category',
            },
          },
        ],
      },
      {
        name: 'body',
        type: 'bodyPortableText',
        title: 'Body',
      },
    ],
    orderings: [
      {
        name: 'publishingDateAsc',
        title: 'Publishing date new–>old',
        by: [
          {
            field: 'publishedAt',
            direction: 'asc',
          },
          {
            field: 'title',
            direction: 'asc',
          },
        ],
      },
      {
        name: 'publishingDateDesc',
        title: 'Publishing date old->new',
        by: [
          {
            field: 'publishedAt',
            direction: 'desc',
          },
          {
            field: 'title',
            direction: 'asc',
          },
        ],
      },
    ],
    preview: {
      select: {
        title: 'title',
        publishedAt: 'publishedAt',
        slug: 'slug',
        media: 'mainImage',
      },
      prepare({ title = 'No title', publishedAt, slug = {}, media }) {
        const path = `/zundfolge/${slug.current}`
        return {
          title,
          media,
          subtitle: publishedAt ? path : 'Missing publishing date',
        }
      },
    },
  }