import S from '@sanity/desk-tool/structure-builder'
import { GoBrowser as PageIcon, GoFile, GoHome, GoSettings } from 'react-icons/go'
import blog from './src/structure/blog'
import events from './src/structure/events'
import advertisers from './src/structure/advertisers'
import landingPages from './src/structure/landingPages'
import PreviewIFrame from './src/components/previewIFrame'
import SocialPreview from 'part:social-preview/component'
import { toPlainText } from 'part:social-preview/utils'
import resolveSlugByType from './resolveSlugByType'

const hiddenDocTypes = (listItem) =>
  !['route', 'navigationMenu', 'post', 'page', 'siteSettings', 'author', 'category', 'event', 'eventCategory', 'tier', 'advertiser', 'advertiserCategory'].includes(
    listItem.getId()
  )

export default () =>
  S.list()
    .title('Content')
    .items([
      S.documentListItem()
        .schemaType('siteSettings')
        .title('Site settings')
        .icon(GoSettings)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .views([S.view.form(), PreviewIFrame()])
        ),
      S.documentListItem()
        .title('Frontpage')
        .schemaType('page')
        .icon(GoHome)
        .child(
          S.document()
            .schemaType('page')
            .documentId('frontpage')
            .views([S.view.form(), PreviewIFrame()])
        ),
        blog,
        events,
        advertisers,
        landingPages,
      // This returns an array of all the document types
      // defined in schema.js. We filter out those that we have
      // defined the structure above
      ...S.documentTypeListItems().filter(hiddenDocTypes),
    ])

export const getDefaultDocumentNode = ({ schemaType }) => {
  // Add the social preview view only to those schema types that support it
  if (['post', 'event'].includes(schemaType)) {
    return S.document().views([
      S.view.form(),
      S.view.component(
        SocialPreview({
          prepareFunction: (
            { title, mainImage, slug, excerpt }
          ) => ({
            title,
            description: toPlainText(excerpt || []),
            siteUrl: 'https://bmw-club-psr.org',
            ogImage: mainImage,
            slug: `${resolveSlugByType(schemaType)}${slug.current}`
          }),
        }),
      ).title('Social & SEO'),
    ])
  }
  return S.document().views([S.view.form()])
}