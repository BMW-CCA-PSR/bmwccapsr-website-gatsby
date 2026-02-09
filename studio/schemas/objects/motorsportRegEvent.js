import MotorsportRegEventInput from '../../src/components/MotorsportRegEventInput'

export default {
    name: 'motorsportRegEvent',
    type: 'object',
    title: 'MotorsportReg event',
    components: {
      input: MotorsportRegEventInput
    },
    fields: [
      {
        name: 'eventId',
        type: 'string',
        title: 'Event ID',
        readOnly: true
      },
      {
        name: 'name',
        type: 'string',
        title: 'Event name',
        readOnly: true
      },
      {
        name: 'start',
        type: 'datetime',
        title: 'Start date',
        readOnly: true
      },
      {
        name: 'end',
        type: 'datetime',
        title: 'End date',
        readOnly: true
      },
      {
        name: 'url',
        type: 'url',
        title: 'Event URL',
        readOnly: true
      },
      {
        name: 'venueName',
        type: 'string',
        title: 'Venue name',
        readOnly: true
      },
      {
        name: 'venueCity',
        type: 'string',
        title: 'Venue city',
        readOnly: true
      },
      {
        name: 'venueRegion',
        type: 'string',
        title: 'Venue state',
        readOnly: true
      },
      {
        name: 'imageUrl',
        type: 'url',
        title: 'Event image',
        readOnly: true
      },
      {
        name: 'organizationId',
        type: 'string',
        title: 'Organization ID',
        readOnly: true
      }
    ],
    preview: {
      select: {
        title: 'name',
        subtitle: 'start'
      }
    }
  }
