const normalizeEventSource = (value) => String(value || '').trim().toLowerCase()

const getEventSource = (document) => {
  const normalized = normalizeEventSource(document?.source)
  return normalized === 'msr' ? 'msr' : 'manual'
}

const isMsrSource = (document) => getEventSource(document) === 'msr'

export default {
    name: 'event',
    type: 'document',
    title: 'Event',
    initialValue: () => ({
        title: 'change me',
        source: 'manual',
        startTime: new Date().toISOString(),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)).toISOString(),
        slug: {
            type: 'slug', 
            name: 'slug',
            current: `draft/${Math.floor(Math.random() * 10000)}`
          },
      }),
    fieldsets: [
        {
          title: 'Event Controls',
          name: 'sourceSettings',
          description: 'Source-level flags for imported MotorsportReg events.'
        },
        {
          title: 'Event Dates',
          name: 'eventDates',
          description: 'Event timing and registration windows.'
        },
        {
          title: 'Registrations',
          name: 'sourceRegistrations',
          description: 'Imported registration metrics from MotorsportReg.'
        },
        {
          title: 'Venue',
          name: 'venue',
          description: 'The place or location where the event is happening.'
        },
        {
          title: 'Sync Metadata',
          name: 'sourceSync',
          description: 'Last sync timestamps and hash values for import diffing.'
        },
      ],
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Title',
            description: 'Manual titles should be catchy and concise. Imported MotorsportReg titles may be longer.',
            validation: Rule =>
              Rule.custom((value, context) => {
                if (!value || !String(value).trim()) {
                  return 'A title is required.'
                }
                if (!isMsrSource(context?.document) && String(value).length > 32) {
                  return 'A manual-event title cannot exceed 32 characters.'
                }
                return true
              }),
        },
        {
            name: 'source',
            type: 'string',
            title: 'Source',
            description: 'Derived from how this event was created (manual in Studio or imported from MSR).',
            initialValue: 'manual',
            readOnly: true,
            validation: Rule =>
              Rule.custom(value => {
                const normalized = normalizeEventSource(value)
                if (!normalized) return true
                return normalized === 'manual' || normalized === 'msr'
                  ? true
                  : 'Source must be either "manual" or "msr".'
              }),
        },
        {
            name: 'sourceIsCancelled',
            type: 'boolean',
            title: 'Cancelled',
            description: 'Whether the source event is currently marked cancelled.',
            fieldset: 'sourceSettings',
            hidden: ({ document }) => !isMsrSource(document),
        },
        {
            name: 'sourceRegistrationOpenAt',
            type: 'datetime',
            title: 'Registration Opens',
            description: 'Source registration open date/time (UTC).',
            fieldset: 'eventDates',
            hidden: ({ document }) => !isMsrSource(document),
        },
        {
            name: 'sourceRegistrationCloseAt',
            type: 'datetime',
            title: 'Registration Closes',
            description: 'Source registration close date/time (UTC).',
            fieldset: 'eventDates',
            hidden: ({ document }) => !isMsrSource(document),
        },
        {
            name: 'sourceRegisterLink',
            type: 'url',
            title: 'Register Link',
            description: 'Direct registration URL from MotorsportReg.',
            fieldset: 'sourceRegistrations',
            hidden: ({ document }) => !isMsrSource(document),
        },
        {
            name: 'sourceIsPublic',
            type: 'boolean',
            title: 'Public',
            description: 'Whether MotorsportReg marks the event as public.',
            fieldset: 'sourceSettings',
            hidden: ({ document }) => !isMsrSource(document),
        },
        {
            name: 'sourceRegistrationCount',
            type: 'number',
            title: 'Registration Count',
            description: 'Latest attendee/registration count from the source system.',
            fieldset: 'sourceRegistrations',
            hidden: ({ document }) => !isMsrSource(document),
        },
        {
            name: 'sourceConfirmedCount',
            type: 'number',
            title: 'Confirmed Count',
            description: 'Count of confirmed/checked-in attendees from the source system.',
            fieldset: 'sourceRegistrations',
            hidden: ({ document }) => !isMsrSource(document),
        },
        {
            name: 'sourceWaitlistCount',
            type: 'number',
            title: 'Waitlist Count',
            description: 'Count of waitlisted attendees from the source system.',
            fieldset: 'sourceRegistrations',
            hidden: ({ document }) => !isMsrSource(document),
        },
        {
            name: 'sourceLastRegistrantUpdateAt',
            type: 'datetime',
            title: 'Last Registrant Update',
            description: 'Most recent attendee registration/update timestamp from MotorsportReg.',
            fieldset: 'sourceRegistrations',
            hidden: ({ document }) => !isMsrSource(document),
        },
        {
            name: 'startTime',
            type: 'datetime',
            title: 'Start Time',
            description: 'The start date/time of the event.',
            fieldset: 'eventDates',
            validation: Rule => Rule.error('You have to select a start time.').required(),
        },
        {
            name: 'endTime',
            type: 'datetime',
            title: 'End Time',
            description: 'The end date/time of the event.',
            fieldset: 'eventDates',
            validation: Rule => Rule.error('End time must be later than start time.').required().min(Rule.valueOfField('startTime'))
        },
        {
            name: 'onlineEvent',
            type: 'boolean',
            title: 'Online meeting/event',
            description: 'Check for Zoom, remote, or online-only events.',
            initialValue: false,
            hidden: ({ document }) => isMsrSource(document),
        },
        {
            name: 'onlineLink',
            type: 'url',
            title: 'Online link',
            description: 'Meeting link (Zoom, Teams, etc.).',
            hidden: ({ document }) => isMsrSource(document) || !document?.onlineEvent,
        },
        {
            name: 'slug',
            type: 'slug',
            title: 'Slug',
            description: 'The unique address that the event will live at. (e.g. "/events/<year>/<month>/your-event")',
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
                source: doc => `${doc.startTime.substring(0, 7).split('-').join('/')}/${doc.title.split(' ').join('-')}`
            },
        },
        {
            name: 'cost',
            type: 'number',
            title: 'Cost',
            description: 'The cost of the event. (leave empty or 0 for free event)',
        },
        {
            name: 'poc',
            type: 'poc',
            title: 'Point of Contact',
            description: 'The Point of Contact for the event.',
        },
        {
            name: 'venueName',
            type: 'string',
            title: 'Name',
            fieldset: 'venue',
            description: 'The name of the venue.',
            hidden: ({ document }) => !!document?.onlineEvent,
        },
        {
            name: 'address',
            type: 'address',
            validation: Rule =>
              Rule.custom((value, context) => {
                if (isMsrSource(context?.document)) return true;
                if (context?.document?.onlineEvent) return true;
                if (!value || !value.line1) return 'Must enter address line1.';
                return true;
              }),
            title: 'Address',
            fieldset: 'venue',
            description: 'The address of the venue.',
            hidden: ({ document }) => !!document?.onlineEvent,
        },
        // {
        // Keep this optional for MSR imports when geo coordinates exist.
        {
            name: 'location',
            type: 'geopoint',
            title: 'Location',
            fieldset: 'venue',
            hidden: ({ document }) => !!document?.onlineEvent,
        },
        {
            name: 'website',
            type: 'string',
            title: 'Website',
            fieldset: 'venue',
            description: 'The website for the venue.',
            hidden: ({ document }) => !!document?.onlineEvent,
        },
        {
            name: 'mainImage',
            type: 'mainImage',
            validation: Rule =>
              Rule.custom((value, context) => {
                if (isMsrSource(context?.document) && value) return true;
                if (value) return true;
                return isMsrSource(context?.document)
                  ? 'MSR events must include a main image.'
                  : 'Must select a main image for the event post.';
              }),
            title: 'Main image',
            description: 'The main image for the event post. Required',
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
            validation: Rule =>
              Rule.custom((value, context) => {
                if (isMsrSource(context?.document)) return true;
                if (value?._ref) return true;
                return 'Must select a category.';
              }),
        },
        {
            name: 'body',
            type: 'bodyPortableText',
            title: 'Body',
            validation: Rule =>
              Rule.custom((value, context) => {
                if (isMsrSource(context?.document)) return true;
                if (Array.isArray(value) && value.length > 0) return true;
                return 'Must enter event body.';
              }),
        },
        {
            name: 'sourceLastSyncedAt',
            type: 'datetime',
            title: 'Last Synced At',
            description: 'UTC timestamp from the last successful source sync for this record.',
            readOnly: true,
            fieldset: 'sourceSync',
            hidden: ({ document }) => !isMsrSource(document),
        },
        {
            name: 'sourceHash',
            type: 'string',
            title: 'Hash',
            description: 'Deterministic hash of source payload fields used for sync diffing.',
            readOnly: true,
            fieldset: 'sourceSync',
            hidden: ({ document }) => !isMsrSource(document),
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
