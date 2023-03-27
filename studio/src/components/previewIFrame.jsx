import React from 'react'
import resolveUrl from '../../resolvePreviewUrl'
import { 
  FiMonitor as Monitor, 
} from 'react-icons/fi'

const env = process.env.NODE_ENV || 'development'

export default (S) => {
  return S.view
    .component(({ document }) => {
      const { displayed } = document
      if (!displayed) {
        return <p>Nothing to display</p>
      }
      const url = resolveUrl(displayed)
      return (
        <React.Fragment>
          <iframe
            style={{
              width: '100%',
              height: '100%',
            }}
            frameBorder={'0'}
            src={url} />
        </React.Fragment>
      )
    }).title('Desktop preview').icon(Monitor)
}
