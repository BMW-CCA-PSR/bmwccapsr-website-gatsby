import {CheckmarkIcon} from '@sanity/icons'
import {inferMetadataState, useWorkflowMetadata} from '../../lib/workflow'
import {useValidationStatus} from '@sanity/react-hooks'

export function ApproveAction(props) {
  const metadata = useWorkflowMetadata(props.id, inferMetadataState(props))
  const {markers} = useValidationStatus(props.id, props.type)

  if (metadata.data.state !== 'inReview') {
    return null
  }

  const onHandle = () => {
    metadata.setState('approved')
    props.onComplete()
  }

  return {
    disabled: markers.length > 0 ? true : false,
    icon: CheckmarkIcon,
    label: 'Approve',
    onHandle
  }
}