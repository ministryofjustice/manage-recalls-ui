import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { RecallResponseLite } from '../../../@types/manage-recalls-api/models/RecallResponseLite'

const beforeAssessStartStatuses = [RecallResponse.status.BEING_BOOKED_ON, RecallResponse.status.BOOKED_ON]

const afterAssessCompleteStatuses = [
  RecallResponse.status.STOPPED,
  RecallResponse.status.RECALL_NOTIFICATION_ISSUED,
  RecallResponse.status.AWAITING_RETURN_TO_CUSTODY,
  RecallResponse.status.DOSSIER_IN_PROGRESS,
  RecallResponse.status.DOSSIER_ISSUED,
]

const afterAssessStartStatuses = [RecallResponse.status.IN_ASSESSMENT, ...afterAssessCompleteStatuses]

const allStatuses = [...beforeAssessStartStatuses, ...afterAssessStartStatuses]

const throwIfStatusInvalid = (status: RecallResponse.status) => {
  if (!allStatuses.includes(status)) {
    throw new Error(`isStatusAfterAssessStart - invalid status ${status}`)
  }
}

export const isStatusAfterAssessStart = (status: RecallResponse.status): boolean => {
  throwIfStatusInvalid(status)
  return afterAssessStartStatuses.includes(status)
}

export const isStatusAfterAssessComplete = (status: RecallResponse.status): boolean => {
  throwIfStatusInvalid(status)
  return afterAssessCompleteStatuses.includes(status)
}

export const isInCustody = (recall: RecallResponse | RecallResponseLite) => {
  if (isStatusAfterAssessStart(recall.status)) {
    if (recall.inCustodyAtBooking) {
      return true
    }
    return recall.inCustodyAtAssessment
  }
  return recall.inCustodyAtBooking
}
