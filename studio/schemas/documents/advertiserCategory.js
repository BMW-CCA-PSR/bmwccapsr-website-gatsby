import { RiAdvertisementLine } from "react-icons/ri";

export default {
    name: 'advertiserCategory',
    type: 'document',
    title: 'Advertiser Category',
    icon: RiAdvertisementLine,
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
      }
    ],
    preview: {
      select: {
        title: 'title'
      },
      prepare({title}) {
        return {
          title: title || 'Untitled advertiser category',
          media: RiAdvertisementLine
        }
      }
    }
  }
