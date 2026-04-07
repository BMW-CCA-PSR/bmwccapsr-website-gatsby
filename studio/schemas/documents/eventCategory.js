import { MdLocalOffer } from "react-icons/md";
import { buildUniqueFieldValidator } from '../utils/uniqueFieldValidation';

export default {
    name: 'eventCategory',
    type: 'document',
    title: 'Event Category',
    icon: MdLocalOffer,
    fields: [
      {
        name: 'title',
        type: 'string',
        title: 'Title',
        validation: (Rule) =>
          Rule.custom(buildUniqueFieldValidator({
            typeName: 'eventCategory',
            fieldPath: 'title',
            label: 'Event category title',
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
          title: title || 'Untitled event category',
          media: MdLocalOffer
        }
      }
    }
  }
