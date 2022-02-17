import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { getLatestVersionFromList, isDefined } from './index'

const beforeAssessStartStatuses = [RecallResponse.status.BEING_BOOKED_ON, RecallResponse.status.BOOKED_ON]

const afterAssessCompleteStatuses = [
  RecallResponse.status.STOPPED,
  RecallResponse.status.ASSESSED_NOT_IN_CUSTODY,
  RecallResponse.status.AWAITING_RETURN_TO_CUSTODY,
  RecallResponse.status.AWAITING_DOSSIER_CREATION,
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

export const isInCustody = (recall: RecallResponse) => {
  if (isStatusAfterAssessStart(recall.status)) {
    if (recall.inCustodyAtBooking) {
      return true
    }
    if (recall.returnedToCustodyDateTime) {
      return true
    }
    return recall.inCustodyAtAssessment
  }
  return recall.inCustodyAtBooking
}

export const isRescindInProgress = (recall: RecallResponse) => {
  if (recall.rescindRecords) {
    const latestRescind = getLatestVersionFromList(recall.rescindRecords)
    return latestRescind && !isDefined(latestRescind.approved)
  }
  return false
}

export const wasLastRescindApproved = (recall: RecallResponse) => {
  if (recall.rescindRecords) {
    const latestRescind = getLatestVersionFromList(recall.rescindRecords)
    return latestRescind && latestRescind.approved === true
  }
  return false
}

export const recallStatusTagProperties = (recall: RecallResponse) => {
  const defaults = {
    classes: `govuk-tag--orange`,
    attributes: {
      'data-qa': 'recallStatus',
    },
  }
  if (isRescindInProgress(recall)) {
    return {
      ...defaults,
      text: 'Rescind in progress',
    }
  }
  switch (recall.status) {
    case RecallResponse.status.DOSSIER_ISSUED:
      return {
        ...defaults,
        text: 'Dossier complete',
        classes: `govuk-tag--green`,
      }
    case RecallResponse.status.BEING_BOOKED_ON:
      return {
        ...defaults,
        text: 'Booking in progress',
      }
    case RecallResponse.status.BOOKED_ON:
      return {
        ...defaults,
        text: 'Booking complete',
      }
    case RecallResponse.status.IN_ASSESSMENT:
      return {
        ...defaults,
        text: 'Assessment in progress',
      }
    case RecallResponse.status.AWAITING_DOSSIER_CREATION:
      return {
        ...defaults,
        text: 'Assessment complete',
      }
    case RecallResponse.status.AWAITING_RETURN_TO_CUSTODY:
      return {
        ...defaults,
        text: 'Awaiting return to custody',
      }
    case RecallResponse.status.DOSSIER_IN_PROGRESS:
      return {
        ...defaults,
        text: 'Dossier in progress',
      }
    case RecallResponse.status.STOPPED:
      return {
        ...defaults,
        text: 'Stopped',
        classes: `govuk-tag--red`,
      }
    default:
      return {
        text: 'Unknown status',
      }
  }
}
