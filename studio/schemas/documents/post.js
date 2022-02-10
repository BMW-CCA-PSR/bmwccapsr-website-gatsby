export default {
    name: 'post',
    type: 'document',
    title: 'Zundfolge Article',
    initialValue: () => ({
      title: 'change me',
      publishedAt: new Date().toISOString(),
      slug: {
        type: 'slug', 
        name: 'slug',
        current: `draft/${Math.floor(Math.random() * 10000)}`
      },
    }),
    fields: [
      {
        name: 'title',
        type: 'string',
        title: 'Title',
        description: 'Titles should be catchy, descriptive, and not too long',
      },
      {
        name: 'publishedAt',
        type: 'datetime',
        title: 'Published at',
        description: 'This can be used to schedule post for publishing',
      },
      {
        name: 'slug',
        type: 'slug',
        title: 'Slug',
        description: 'The unique address that the article will live at. (e.g. "/zundfolge/<year>/<month>/your-article")',
        options: {
          source: 'title',
          maxLength: 96,
          slugify: input => input
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\/\-]+/g, '')
          .replace(/\-\-+/g, '-'),
          // date string represented as "2022-01-01" -- substring values are as follows:
          // 10 == "2020/01/01/"
          // 7 == "2020/01"
          // 4 == "2020"
          source: doc => `${doc.publishedAt.substring(0, 7).split('-').join('/')}/${doc.title.split(' ').join('-')}`
        },
      },
      {
        name: 'mainImage',
        type: 'mainImage',
        validation: Rule => Rule.error('You have to select a main image for the article.').required(),
        title: 'Main image',
        description: 'The main image for the post. Required'
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
        name: 'category',
        type: 'reference',
        to: {
            type: 'category',
        },
        title: 'Category',
        validation: Rule => Rule.error('You have to select a category.').required(),
        options: {
            isHighlighted: true
        },
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