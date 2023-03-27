import { 
  GoBrowser as PageIcon, 
  GoFile, 
  GoHome, 
  GoSettings,
  GoPencil as EditIcon,
} from 'react-icons/go'
//import { workflowListItems } from './src/structure/workflow'
import blog from './src/structure/blog'
import events from './src/structure/events'
import advertisers from './src/structure/advertisers'
import landingPages from './src/structure/landingPages'
//import DesktopPreviewIFrame from './src/components/previewIFrame'
import SocialPreviewIFrame from './src/components/socialPreviewIFrame'

// const hiddenDocTypes = (listItem) =>
//   !['workflow.metadata', 'media.tag', 'route', 'navigationMenu', 'post', 'page', 'siteSettings', 'author', 'category', 'event', 'eventCategory', 'tier', 'advertiser', 'advertiserCategory'].includes(
//     listItem.getId()
//   )

export default (S) =>
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
            .views([
              S.view.form().icon(EditIcon),
              //DesktopPreviewIFrame()
            ])
      ),
      S.documentListItem()
        .title('Frontpage')
        .schemaType('page')
        .icon(GoHome)
        .child(
          S.document()
            .schemaType('page')
            .documentId('frontpage')
            .views([
              S.view.form().icon(EditIcon),
              //DesktopPreviewIFrame()
            ])
      ),
      // blog, 
      // events,
      // advertisers,
      // landingPages,
      S.divider(),
      //...workflowListItems,
      // This returns an array of all the document types
      // defined in schema.js. We filter out those that we have
      // defined the structure above
      //...S.documentTypeListItems().filter(hiddenDocTypes),
    ])

export const getDefaultDocumentNode = ({ schemaType }) => {
  // Add the social preview view only to those schema types that support it
  if (['post', 'event'].includes(schemaType)) {
    return S.document().views([
      S.view.form().icon(EditIcon),
      //DesktopPreviewIFrame(),
      SocialPreviewIFrame(schemaType),
    ])
  }
  return S.document().views([
    S.view.form().icon(EditIcon),
  ])
}