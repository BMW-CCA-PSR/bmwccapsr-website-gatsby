import S from '@sanity/desk-tool/structure-builder'
import {
  RiCalendarCheckLine as ActiveIcon,
  RiCalendar2Line as AllEventIcon,
  RiCalendarEventLine as CatIcon,
} from 'react-icons/ri'
import SocialPreview from 'part:social-preview/component'
import PreviewIFrame from '../../src/components/previewIFrame'
import { toPlainText } from 'part:social-preview/utils'
import resolveSlugByType from '../../resolveSlugByType'

export const icons = {
    ActiveIcon,
    AllEventIcon,
    CatIcon
  }

  const events = S.listItem()
  .title('Events')
  .icon(ActiveIcon)
  .child(
    S.list()
      .title('Events')
      .items([
        S.listItem()
        .title('Active events')
        .schemaType('event')
        .icon(ActiveIcon)
        .child(
          S.documentList('event')
              .title('Active events')
              .menuItems(S.documentTypeList('event').getMenuItems())
              // Only show events with startTime date later than now and that is not drafts
              .filter('_type == "event" && startTime > now() && !(_id in path("drafts.**"))')
              .child((documentId) =>
                S.document()
                  .documentId(documentId)
                  .schemaType('event')
                  .views([
                    S.view.form(), 
                    PreviewIFrame(),
                    S.view.component(
                      SocialPreview({
                          prepareFunction: (
                            { title, mainImage, slug, excerpt }
                          ) => ({
                            title,
                            description: toPlainText(excerpt || []),
                            siteUrl: 'https://bmw-club-psr.org',
                            ogImage: mainImage,
                            slug: `${resolveSlugByType('event')}${slug.current}`
                          }),
                        }),
                      ).title('Social & SEO')])
              )
          ),
        S.documentTypeListItem('event').title('All events').icon(AllEventIcon),
        S.listItem()
        .title('Events by category')
        .child(
          // List out all categories
          S.documentTypeList('eventCategory')
            .title('Events by category')
            .child(catId =>
              // List out project documents where the _id for the selected
              // category appear as a _ref in the project’s categories array
              S.documentList()
                .schemaType('events')
                .title('Events')
                .filter(
                  '_type == "event" && $catId in categories[]._ref'
                )
                .params({ catId })
            )
          ),
        S.divider(),
        S.documentTypeListItem('eventCategory').title('Categories').icon(CatIcon)
      ])
  )

export default events