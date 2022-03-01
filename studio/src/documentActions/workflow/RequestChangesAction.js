import {EditIcon} from '@sanity/icons'
import {inferMetadataState, useWorkflowMetadata} from '../../lib/workflow'
import {useValidationStatus} from '@sanity/react-hooks'

export function RequestChangesAction(props) {
  const metadata = useWorkflowMetadata(props.id, inferMetadataState(props))
  const {markers} = useValidationStatus(props.id, props.type)

  if (metadata.data.state !== 'inReview') {
    return null
  }

  const onHandle = () => {
    metadata.setState('changesRequested')
    props.onComplete()
  }

  return {
    disabled: markers.length > 0 ? true : false,
    icon: EditIcon,
    label: 'Request changes',
    onHandle
  }
}