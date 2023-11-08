import React from 'react'
import resolveUrl from '../../resolvePreviewUrl'
import { 
  FiMonitor as Monitor, 
} from 'react-icons/fi'
import {
  GoPencil as EditIcon,
} from 'react-icons/go'
import Iframe from 'sanity-plugin-iframe-pane'

const env = process.env.NODE_ENV || 'development'

// Import this into the deskTool() plugin
export const defaultDocumentNode = (S, {schemaType}) => {
  console.log(schemaType)
  switch (schemaType) {
    case `event`:
    case `post`:
      return S.document().views([
        S.view.form().icon(EditIcon),
        S.view
          .component(Iframe)
          .options({
            url: (doc) => resolveUrl(doc),
          })
          .title('Desktop preview').icon(Monitor),
      ])
    default:
      return S.document().views([S.view.form().icon(EditIcon)])
  }
}
