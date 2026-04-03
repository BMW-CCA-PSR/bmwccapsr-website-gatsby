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
            type: 'string',
            title: 'Contact',
        },
        {
            name: 'alias',
            type: 'reference',
            title: 'Alias',
            description: 'Optional email alias to show as a mailto link on the event page.',
            to: [{ type: 'emailAlias' }],
            weak: true,
            options: {
                disableNew: true,
                filter: '_type == "emailAlias" && enabled != false',
            },
        }
    ]
}
