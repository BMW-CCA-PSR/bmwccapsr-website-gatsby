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
        description: 'Titles should be catchy, descriptive, and not too long (< 32 characters)',
        validation: Rule => Rule.max(32).error(`A title cannot exceed 32 characters.`).required(),
      },
      {
        name: 'featured',
        type: 'boolean',
        title: 'Featured article',
        description: 'Only one article can be featured at a time.',
        validation: Rule =>
          Rule.custom(async (value, context) => {
            if (!value) return true;
            const docId = context?.document?._id;
            if (!docId || !context?.getClient) return true;
            const client = context.getClient({ apiVersion: '2023-10-01' });
            const publishedId = docId.replace(/^drafts\./, '');
            const draftId = `drafts.${publishedId}`;
            const count = await client.fetch(
              'count(*[_type == "post" && featured == true && !(_id in [$draftId, $publishedId])])',
              { draftId, publishedId }
            );
            return count > 0 ? 'Only one article can be featured at a time.' : true;
          })
      },
      {
        name: 'publishedAt',
        type: 'datetime',
        title: 'Published at',
        description: 'This can be used to schedule post for publishing',
        validation: Rule => Rule.required()
      },
      {
        name: 'slug',
        type: 'slug',
        title: 'Slug',
        description: 'The unique address that the article will live at. (e.g. "/zundfolge/<year>/<month>/your-article")',
        options: {
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
        validation: Rule => Rule.required(),
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
        validation: Rule => Rule.error('Must select an author.').required().min(1),
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
        validation: Rule => Rule.error('Must select a category.').required(),
      },
      {
        name: 'body',
        type: 'bodyPortableText',
        validation: Rule => Rule.error('Must enter article body.').required(),
        title: 'Body',
      },
      {
        name: 'archiveIssue',
        type: 'reference',
        title: 'Printed Issue (Archive)',
        description: 'Optional link to the single Zundfolge archive issue this article belongs to.',
        to: [
          {
            type: 'zundfolgeIssue',
          },
        ],
        options: {
          disableNew: true,
        },
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
