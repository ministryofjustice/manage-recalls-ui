import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'

export const isStatusAfterAssessStart = (status: RecallResponse.status) => {
  return [
    RecallResponse.status.IN_ASSESSMENT,
    RecallResponse.status.STOPPED,
    RecallResponse.status.RECALL_NOTIFICATION_ISSUED,
    RecallResponse.status.AWAITING_RETURN_TO_CUSTODY,
    RecallResponse.status.DOSSIER_IN_PROGRESS,
    RecallResponse.status.DOSSIER_ISSUED,
  ].includes(status)
}
