import states from '../components/states'

export default {
    name: 'address',
    type: 'object',
    title: 'Address',
    fields: [
        {
            name: 'line1',
            type: 'string',
            validation: Rule => Rule.required(),
            title: 'Line 1',
        },
        {
            name: 'line2',
            type: 'string',
            title: 'Line 2',
        },
        {
            name: 'city',
            type: 'string',
            title: 'City',
        },
        {
            title: 'State',
            name: 'state',
            type: 'string',
            options: {
              list: [
                ...states
              ],
            }
        },
    ]
}