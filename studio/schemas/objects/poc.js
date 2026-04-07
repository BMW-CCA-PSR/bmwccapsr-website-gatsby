import SingleItemArrayInput from '../../src/components/SingleItemArrayInput'

export default {
    name: 'poc',
    type: 'object',
    title: 'Point of Contact',
    fields: [
        {
            name: 'name',
            type: 'string',
            title: 'Name',
        },
        {
            name: 'contact',
            type: 'array',
            title: 'Contact',
            description: 'Select an email alias or enter an email address.',
            of: [
                { type: 'emailAliasReferenceRecipient' },
                { type: 'emailAliasAddressRecipient' },
            ],
            validation: Rule => Rule.max(1),
            components: { input: SingleItemArrayInput },
        },
    ]
}
