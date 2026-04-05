import { ImStatsBars2 } from "react-icons/im";

export default {
    name: 'tier',
    type: 'document',
    title: 'Tier',
    icon: ImStatsBars2,
    fields: [
      {
        name: 'title',
        type: 'string',
        title: 'Title'
      },
      {
        name: 'description',
        type: 'text',
        title: 'Description'
      },
      {
        name: 'rate',
        type: 'number',
        title: 'Rate',
        description: 'The cost per quarter for this tier'
      }
    ],
    preview: {
      select: {
        title: 'title'
      },
      prepare({title}) {
        return {
          title: title || 'Untitled tier',
          media: ImStatsBars2
        }
      }
    }
  }
