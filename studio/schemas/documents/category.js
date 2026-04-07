import { MdLocalOffer } from "react-icons/md";
import { buildUniqueFieldValidator } from '../utils/uniqueFieldValidation';

export default {
    name: 'category',
    type: 'document',
    title: 'Category',
    icon: MdLocalOffer,
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
    ],
    preview: {
      select: {
        title: 'title'
      },
      prepare({title}) {
        return {
          title: title || 'Untitled category',
          media: MdLocalOffer
        }
      }
    }
  }
