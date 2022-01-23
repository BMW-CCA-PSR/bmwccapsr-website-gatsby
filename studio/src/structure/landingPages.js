import S from '@sanity/desk-tool/structure-builder'
import { 
  MdMenu, 
  MdBuild 
} from 'react-icons/md'
import {
  GoPencil as EditIcon,
} from 'react-icons/go'
import DesktopPreviewIFrame from '../../src/components/previewIFrame'

export default S.listItem()
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
                  .views([
                    S.view.form().icon(EditIcon),, 
                    DesktopPreviewIFrame()
                  ])
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