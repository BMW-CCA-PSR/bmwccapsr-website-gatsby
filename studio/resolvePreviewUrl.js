const env = process.env.NODE_ENV || 'development'

export default function resolvePreviewUrl(document) {
  const baseUrl = env === 'development' ? 'http://localhost:8000' : `https://preview-bmwccapsrwebsitegatsby.gtsb.io`
  switch (document._type) {
    case 'route':
      if (!document.slug) {
        return baseUrl
      }
      return `${baseUrl}/${document.slug.current}`
    case 'post':
      return `${baseUrl}/zundfolge/${document.slug.current}`
    case 'event':
      return `${baseUrl}/events/${document.slug.current}`
    case 'siteSettings':
      return baseUrl
    case 'page':
      if (document._id === 'frontpage' || document._id === 'drafts.frontpage') {
        return baseUrl
      }
      return null
    default:
      return null
  }
}