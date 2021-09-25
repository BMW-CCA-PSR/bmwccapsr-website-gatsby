import { BiSlideshow } from "react-icons/bi";

export default {
    type: 'object',
    name: 'heroCarousel',
    icon: BiSlideshow,
    fields: [
      {
        type: 'string',
        name: 'title'
      },
      {
        type: 'array',
        name: 'slides',
        of: [
          { type: 'hero' },
        ]
      }
    ]
  }