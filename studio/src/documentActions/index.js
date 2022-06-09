import defaultResolver from 'part:@sanity/base/document-actions'
import { gatsbyPreviewAction } from "sanity-plugin-gatsby-cloud-preview";
import {types as workflowTypes} from '../config/workflow'
import {resolveWorkflowActions} from './workflow'

export default function resolveDocumentActions(docInfo) {
  if (workflowTypes.includes(docInfo.type)) {
    return [...resolveWorkflowActions(docInfo)] //, gatsbyPreviewAction]
  }

  return [...defaultResolver(docInfo)] //, gatsbyPreviewAction]
}