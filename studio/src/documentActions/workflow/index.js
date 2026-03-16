import {ApproveAction} from './ApproveAction'
import {DeleteAction} from './DeleteAction'
import {DiscardChangesAction} from './DiscardChangesAction'
import {PublishAction} from './PublishAction'
import {RequestChangesAction} from './RequestChangesAction'
import {RequestReviewAction} from './RequestReviewAction'
import {SyncAction} from './SyncAction'
import {UnpublishAction} from './Unpublish'
import {SyncWithMsrAction} from '../msrSyncAction'

export function resolveWorkflowActions(/* docInfo */) {
  return [
    SyncWithMsrAction,
    PublishAction,
    SyncAction,
    RequestReviewAction,
    ApproveAction,
    RequestChangesAction,
    UnpublishAction,
    DiscardChangesAction,
    DeleteAction
  ]
}
