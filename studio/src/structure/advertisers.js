import S from '@sanity/desk-tool/structure-builder'
import {
    RiAdvertisementLine as AdIcon,
    RiAdvertisementFill as AdIconFill,
} from 'react-icons/ri'
import {
  GoPencil as EditIcon,
} from 'react-icons/go'
import { 
  ImStatsBars2 as TierIcon 
} from 'react-icons/im'
import DesktopPreviewIFrame from '../../src/components/previewIFrame'

export const icons = {
    AdIcon,
    AdIconFill,
    TierIcon
  }

  const advertisers = S.listItem()
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
                  .views([
                    S.view.form().icon(EditIcon),
                    DesktopPreviewIFrame()
                  ])
              )
          ),
        S.documentTypeListItem('advertiser').title('All advertisers').icon(AdIcon),
        S.listItem()
        .title('Advertisers by category')
        .child(
          S.documentTypeList('advertiserCategory')
            .title('Advertisers by category')
            .child(catId =>
              S.documentList()
                .schemaType('advertisers')
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
              S.documentList()
                .schemaType('advertisers')
                .title('Advertisers')
                .filter(
                  '_type == "advertiser" && $tierId == tier._ref'
                )
                .params({ tierId })
            )
          ),
        S.divider(),
        S.documentTypeListItem('tier').title('Rate Tiers').icon(TierIcon),
        S.documentTypeListItem('advertiserCategory').title('Categories')
      ])
  )

export default advertisers