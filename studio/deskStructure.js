import { 
  GoBrowser as PageIcon, 
  GoFile, 
  GoHome, 
  GoGear as Settings,
  GoPencil as EditIcon,
  GoMegaphone as BlogIcon,
  GoChecklist as ApprovedIcon,
  GoEye as ReviewIcon,
  GoCircleSlash as RejectedIcon,
  GoArchive as AllIcon,
  GoPerson as AuthorIcon,
} from 'react-icons/go'
import {
  RiCalendarCheckLine as ActiveIcon,
  RiCalendar2Line as AllEventIcon,
  RiCalendarEventLine as CatIcon,
  RiAdvertisementLine as AdIcon,
  RiAdvertisementFill as AdIconFill,
} from 'react-icons/ri'
import { 
  ImStatsBars2 as TierIcon 
} from 'react-icons/im'
import { 
  MdMenu, 
  MdBuild 
} from 'react-icons/md'
//import { workflowListItems } from './src/structure/workflow'

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
        .icon(Settings)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
      ),
      S.documentListItem()
        .title('Frontpage')
        .schemaType('page')
        .icon(GoHome)
        .child(
          S.document()
            .schemaType('page')
            .documentId('frontpage')
      ),
      // zundfolge
      S.listItem()
        .title('Zundfolge')
        .icon(BlogIcon)
        .child(
          S.list()
            .title('Zundfolge')
            .items([
              S.listItem()
                .title('Published articles')
                .icon(BlogIcon)
                .id('publishedArticles')
                .child(
                  S.documentTypeList('post')
                    .title('Published articles')
                    .menuItems(S.documentTypeList('post').getMenuItems())
                    // Only show posts with publish date earlier than now and that is not drafts
                    .filter('_type == "post" && publishedAt < now() && !(_id in path("drafts.**"))')
                    .child((documentId) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('post')
                    )
                ),
              S.documentTypeListItem('post')
                .title('All articles')
                .icon(AllIcon),
              S.listItem()
                .title('Articles by category')
                .child(
                  // List out all categories
                  S.documentTypeList('category')
                    .title('Articles by category')
                    .child(catId =>
                      // List out project documents where the _id for the selected
                      // category appear as a _ref in the project’s categories array
                      S.documentTypeList('post')
                        .title('Articles')
                        .filter(
                          '_type == "post" && $catId == category._ref'
                        )
                        .params({ catId })
                        .child((documentId) =>
                          S.document()
                            .documentId(documentId)
                            .schemaType('post')
                        )
                    )
        ),
        S.divider(),
        S.documentTypeListItem('author').title('Authors').icon(AuthorIcon),
        S.documentTypeListItem('category').title('Categories')
      ])
      ),
      // events 
      S.listItem()
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
                      )
                  ),
              S.documentTypeListItem('event')
                .title('All events')
                .icon(AllEventIcon),
              S.listItem()
                .title('Events by category')
                .child(
                  // List out all categories
                  S.documentTypeList('eventCategory')
                    .title('Events by category')
                    .child(catId =>
                      // List out project documents where the _id for the selected
                      // category appear as a _ref in the project’s categories array
                      S.documentTypeList('event')
                        .title('Events')
                        .filter(
                          '_type == "event" && $catId == category._ref'
                        )
                        .params({ catId })
                        .child((documentId) =>
                          S.document()
                            .documentId(documentId)
                            .schemaType('event')
                        )
                    )
                ),
              S.divider(),
              S.documentTypeListItem('eventCategory')
                .title('Categories')
                .icon(CatIcon)
            ])
        ),
        // advertisers
        S.listItem()
        .title('Advertisers')
        .icon(AdIcon)
        .child(
          S.list()
            .title('Advertisers')
            .items([
              S.listItem()
                .title('Active advertisers')
                .schemaType('advertiser')
                .icon(AdIconFill)
                .child(
                  S.documentList('advertiser')
                    .title('Active advertiser')
                    .menuItems(S.documentTypeList('advertiser').getMenuItems())
                    .filter('_type == "advertiser" && active && !(_id in path("drafts.**"))')
                    .child((documentId) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('advertiser')
                    )
                ),
              S.listItem()
                .title('Active partners')
                .schemaType('advertiser')
                .icon(AdIconFill)
                .child(
                  S.documentList('advertiser')
                      .title('Active partners')
                      .menuItems(S.documentTypeList('advertiser').getMenuItems())
                      .filter('_type == "advertiser" && partner && !(_id in path("drafts.**"))')
                      .child((documentId) =>
                        S.document()
                          .documentId(documentId)
                          .schemaType('advertiser')
                      )
                ),
              S.documentTypeListItem('advertiser')
                .title('All advertisers')
                .icon(AdIcon),
              S.listItem()
                .title('Advertisers by category')
                .child(
                  S.documentTypeList('advertiserCategory')
                    .title('Advertisers by category')
                    .child(catId =>
                      S.documentTypeList('advertisers')
                        .title('Advertisers')
                        .filter(
                          '_type == "advertiser" && $catId == category._ref'
                        )
                        .params({ catId })
                    )
                  ),
              S.listItem()
                .title('Advertisers by tier')
                .child(
                  S.documentTypeList('tier')
                    .title('Advertisers by tier')
                    .child(tierId =>
                      S.documentTypeList('advertisers')
                        .title('Advertisers')
                        .filter(
                          '_type == "advertiser" && $tierId == tier._ref'
                        )
                        .params({ tierId })
                    )
                  ),
              S.divider(),
              S.documentTypeListItem('tier')
                .title('Rate Tiers')
                .icon(TierIcon),
              S.documentTypeListItem('advertiserCategory')
                .title('Categories')
            ])
        ),
        // page builder
        S.listItem()
          .title('Page Builder')
          .icon(MdBuild)
          .child(
            S.list()
              .title('Landing Pages')
              .items([
                S.listItem()
                  .title('Navigation Menus')
                  .icon(MdMenu)
                  .schemaType('navigationMenu')
                  .child(S.documentTypeList('navigationMenu').title('Navigation Menus')),
                S.listItem()
                  .title('Routes')
                  .schemaType('route')
                  .child(
                    S.documentTypeList('route')
                      .title('Routes')
                      .child((documentId) =>
                        S.document()
                          .documentId(documentId)
                          .schemaType('route')
                      )
                  ),
                S.listItem()
                  .title('Pages')
                  .schemaType('page')
                  .child(
                    S.documentList('page')
                      .title('Pages')
                      .menuItems(S.documentTypeList('page').getMenuItems())
                      .filter('_type == "page" && _id != "frontpage"')
                  ),
              ])
          ),
      S.divider(),
      //...workflowListItems,
      // This returns an array of all the document types
      // defined in schema.js. We filter out those that we have
      // defined the structure above
      //...S.documentTypeListItems().filter(hiddenDocTypes),
    ])
