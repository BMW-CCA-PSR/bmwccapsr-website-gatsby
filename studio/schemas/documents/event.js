import states from '../components/states'

export default {
    name: 'event',
    type: 'document',
    title: 'Event',
    fieldsets: [
        {
          title: 'Venue',
          name: 'venue',
        },
      ],
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
            validation: Rule => Rule.error('End time must be later than start time.').required().min(Rule.valueOfField('startTime'))
        },
        {
            name: 'cost',
            type: 'number',
            title: 'Cost',
            description: 'The cost of the event. (leave empty or 0 for free event)'
        },
        {
            name: 'venueName',
            type: 'string',
            title: 'Name',
            fieldset: 'venue',
            description: 'The name of the venue.',
        },
        {
            name: 'address',
            type: 'address',
            validation: Rule => Rule.required(),
            title: 'Address',
            fieldset: 'venue',
            description: 'The address of the venue.',
        },
        {
            name: 'location',
            type: 'geopoint',
            validation: Rule => Rule.required(),
            title: 'Location',
            fieldset: 'venue'
        },
        {
            name: 'website',
            type: 'string',
            title: 'Website',
            fieldset: 'venue',
            description: 'The website for the venue.',
        },
        {
            name: 'mainImage',
            type: 'mainImage',
            validation: Rule => Rule.error('You have to select a main image for the event post.').required(),
            title: 'Main image',
            description: 'The main image for the event post. Required'
        },
        {
            name: 'excerpt',
            type: 'excerptPortableText',
            title: 'Excerpt',
            description:
                'This ends up on summary pages, on Google, when people share the event in social media.',
        },
        {
            name: 'category',
            type: 'reference',
            to: {
                type: 'eventCategory',
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