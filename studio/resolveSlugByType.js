export default function resolveSlugByType(type) {
    switch (type) {
      case 'post':
        return `/zundfolge/`
      case 'event':
        return `/events/`
      default:
        return null
    }
  }