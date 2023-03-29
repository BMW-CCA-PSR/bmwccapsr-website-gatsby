import { MdVideocam, MdPhotoCamera } from 'react-icons/md'
import InstagramPreview from '../components/preview/Instagram'
import EmbedPlayer from '../components/preview/EmbedPlayer'

export const instagram = {
  type: 'object',
  name: 'instagram',
  title: 'Instagram Post',
  icon: MdPhotoCamera,
  fields: [
    {
      type: 'url',
      name: 'url',
      description: 'The URL to the post as seen in a desktop browser',
    },
  ],
  components: {
    select: { url: 'url' },
    preview: InstagramPreview,
  },
}

export const videoEmbed = {
  type: 'object',
  name: 'videoEmbed',
  title: 'Video Embed',
  icon: MdVideocam,
  fields: [
    {
      type: 'url',
      name: 'url',
    },
  ],
  components: {
    select: { url: 'url' },
    preview: EmbedPlayer,
  },
}