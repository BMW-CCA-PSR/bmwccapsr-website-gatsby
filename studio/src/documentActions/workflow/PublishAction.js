import {PublishIcon} from '@sanity/icons'
import {useValidationStatus} from '@sanity/react-hooks'
import {useDocumentOperation} from '@sanity/react-hooks'
import {inferMetadataState, useWorkflowMetadata} from '../../lib/workflow'

export function PublishAction(props) {
  const ops = useDocumentOperation(props.id, props.type)
  const {markers} = useValidationStatus(props.id, props.type)
  const metadata = useWorkflowMetadata(props.id, inferMetadataState(props))
  if (props.liveEdit || metadata.data.state === 'published') {
    return null
  }

  const onHandle = () => {
    if (ops.publish.disabled) {
      props.onComplete()
      return
    }

    metadata.setState('published')
    metadata.clearAssignees()
    ops.publish.execute()
    props.onComplete()
  }

  return {
    disabled: markers.length > 0 ? true : ops.publish.disabled,
    icon: PublishIcon,
    shortcut: 'mod+shift+p',
    label: 'Publish',
    onHandle
  }
}