export default {
    name: 'event',
    type: 'document',
    title: 'Event',
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
            description: 'The unique address that the event will live at. (e.g. "/events/your-event")',
            options: {
                source: 'title',
                maxLength: 96,
            },
        },
        {
            name: 'startTime',
            type: 'datetime',
            title: 'Start Time',
            description: 'The start date/time of the event.',
            validation: Rule => Rule.error('You have to select a start time.').required(),
            options: {
                isHighlighted: true
            },
        },
        {
            name: 'endTime',
            type: 'datetime',
            title: 'End Time',
            description: 'The end date/time of the event.',
        },
        {
            name: 'location',
            type: 'geopoint',
            validation: Rule => Rule.required(),
            title: 'Event Location',
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
                'This ends up on summary pages, on Google, when people share the event in social media.',
        },
        {
            name: 'categories',
            type: 'array',
            title: 'Categories',
            validation: Rule => Rule.error('You have to select a category.').required().min(1),
            options: {
                isHighlighted: true
            },
            of: [
                {
                    type: 'reference',
                    to: {
                        type: 'eventCategory',
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
    preview: {
        select: {
            title: 'title',
            startTime: 'startTime',
            slug: 'slug',
            media: 'mainImage',
        },
        prepare({ title = 'No title', startTime, slug = {}, media }) {
            const path = `/events/${slug.current}`
            return {
                title,
                media,
                subtitle: startTime ? path : 'Missing event start date',
            }
        },
    },
}