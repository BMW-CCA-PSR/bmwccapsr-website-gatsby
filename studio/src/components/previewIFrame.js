import React from 'react'
import S from '@sanity/desk-tool/structure-builder'
import resolveUrl from '../../resolvePreviewUrl'
import { MdMonitor } from "react-icons/md"

const env = process.env.NODE_ENV || 'development'

function DesktopPreviewIFrame() {
  return S.view
    .component(({ document }) => {
      const { displayed } = document
      if (!displayed) {
        return <p>Nothing to display</p>
      }
      const url = resolveUrl(displayed)
      return (
        <React.Fragment>
          {env !== 'development' && <div style={{ padding: '0 0.5em' }}>
            <p>This is a production preview showing content updates on Gatsby Cloud. <a href="/dashboard">Trigger a full deployment</a> to publish changes.</p>
          </div>}
          <iframe
            style={{
              width: '100%',
              height: '100%'
            }}
            frameBorder={'0'}
            src={url} />
        </React.Fragment>
      )
    })
    .title('Desktop preview').icon(MdMonitor)
}

export default DesktopPreviewIFrame