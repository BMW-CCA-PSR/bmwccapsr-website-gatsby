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
  RiFolder2Line as CatIcon,
  RiAdvertisementLine as AdIcon,
  RiAdvertisementFill as AdIconFill,
  RiHeartLine as HeartIcon,
  RiHeartFill as HeartFillIcon,
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
                      S.documentTypeList('advertiser')
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
                      S.documentTypeList('advertiser')
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
        // volunteers
        S.listItem()
        .title('Volunteers')
        .icon(HeartIcon)
        .child(
          S.list()
            .title('Volunteers')
            .items([
              S.listItem()
                .title('Active positions')
                .schemaType('volunteerRole')
                .icon(HeartFillIcon)
                .child(
                  S.documentList('volunteerRole')
                    .title('Active positions')
                    .menuItems(S.documentTypeList('volunteerRole').getMenuItems())
                    .filter(
                      `_type == "volunteerRole" &&
                        active == true &&
                        !(_id in path("drafts.**")) &&
                        (
                          !(
                            defined(motorsportRegEvent.eventId) ||
                            defined(motorsportRegEvent.name) ||
                            defined(motorsportRegEvent.start) ||
                            defined(motorsportRegEvent.url) ||
                            defined(motorsportRegEvent.venueName) ||
                            defined(motorsportRegEvent.venueCity) ||
                            defined(motorsportRegEvent.venueRegion)
                          ) ||
                          (
                            defined(coalesce(motorsportRegEvent.start, date)) &&
                            dateTime(coalesce(motorsportRegEvent.start, date)) >= dateTime(now())
                          )
                        )`
                    )
                    .child((documentId) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('volunteerRole')
                    )
                ),
              S.documentTypeListItem('volunteerRole')
                .title('All positions')
                .icon(HeartIcon),
              S.listItem()
                .title('Positions by role')
                .icon(HeartIcon)
                .child(
                  S.documentTypeList('volunteerFixedRole')
                    .title('Positions by role')
                    .child(roleId =>
                      S.documentTypeList('volunteerRole')
                        .title('Positions')
                        .filter(
                          '_type == "volunteerRole" && $roleId == role._ref'
                        )
                        .params({ roleId })
                        .child((documentId) =>
                          S.document()
                            .documentId(documentId)
                            .schemaType('volunteerRole')
                        )
                    )
                ),
              S.divider(),
              S.documentTypeListItem('volunteerFixedRole')
                .title('Roles'),
              S.listItem()
                .title('Roles by point value')
                .child(
                  S.list()
                    .title('Roles by point value')
                    .items(
                      [1, 2, 3, 4, 5, 10].map((pointValue) =>
                        S.listItem()
                          .id(`volunteer-roles-point-${pointValue}`)
                          .title(`${pointValue} point${pointValue === 1 ? '' : 's'}`)
                          .child(
                            S.documentTypeList('volunteerFixedRole')
                              .title(`${pointValue} point${pointValue === 1 ? '' : 's'}`)
                              .filter('_type == "volunteerFixedRole" && pointValue == $pointValue')
                              .params({ pointValue })
                          )
                      )
                    )
                )
            ])
        ),
        S.divider(),
        // site settings
        S.listItem()
          .id('siteSettings')
          .title('Site Settings')
          .icon(Settings)
          .child(
            S.document()
              .schemaType('siteSettings')
              .documentId('siteSettings')
        ),
        // page settings
        S.listItem()
          .id('pageSettings')
          .title('Page Settings')
          .icon(PageIcon)
          .child(
            S.list()
              .title('Page Settings')
              .items([
                S.listItem()
                  .id('frontpage')
                  .title('Homepage Settings')
                  .icon(GoHome)
                  .child(
                    S.document()
                      .schemaType('page')
                      .documentId('frontpage')
                      .title('Homepage Settings')
                  ),
                S.listItem()
                  .id('joinPage')
                  .title('Join Page Settings')
                  .icon(PageIcon)
                  .child(
                    S.document()
                      .schemaType('page')
                      .documentId('join')
                      .title('Join Page Settings')
                  ),
                S.divider(),
                S.listItem()
                  .title('All Pages')
                  .icon(PageIcon)
                  .child(
                    S.documentList('page')
                      .title('All Pages')
                      .menuItems(S.documentTypeList('page').getMenuItems())
                      .filter(
                        '_type == "page" && !(_id in ["frontpage","join","drafts.frontpage","drafts.join"])'
                      )
                  )
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
          )
    ])
