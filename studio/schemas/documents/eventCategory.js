import { RiFolder2Line } from "react-icons/ri";
import { buildUniqueFieldValidator } from '../utils/uniqueFieldValidation';

export default {
    name: 'eventCategory',
    type: 'document',
    title: 'Event Category',
    icon: RiFolder2Line,
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
          media: RiFolder2Line
        }
      }
    }
  }
