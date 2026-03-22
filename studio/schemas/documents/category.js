import { buildUniqueFieldValidator } from '../utils/uniqueFieldValidation';

export default {
    name: 'category',
    type: 'document',
    title: 'Category',
    fields: [
      {
        name: 'title',
        type: 'string',
        title: 'Title',
        validation: (Rule) =>
          Rule.custom(buildUniqueFieldValidator({
            typeName: 'category',
            fieldPath: 'title',
            label: 'Category title',
          })),
      },
      {
        name: 'description',
        type: 'text',
        title: 'Description'
      }
    ]
  }