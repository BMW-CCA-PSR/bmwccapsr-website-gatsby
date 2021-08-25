const env = process.env.NODE_ENV || 'development'
import { PREVIEW, DOMAIN } from "../infra/config"

export default function resolvePreviewUrl(document) {
  const baseUrl = env === 'development' ? 'http://localhost:8000' : `https://${PREVIEW}.${DOMAIN}`
  switch (document._type) {
    case 'route':
      if (!document.slug || !document.slug.current) {
        return baseUrl
      }
      return `${baseUrl}/${document.slug.current}`
    case 'post':
      return `${baseUrl}/blog/${document.slug.current}`
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