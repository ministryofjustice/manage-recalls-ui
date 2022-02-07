import { isInCustody } from './recallStatus'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'

describe('isInCustody', () => {
  it('returns true if assessment not started and in custody at booking', () => {
    const recall = {
      inCustodyAtBooking: true,
      status: RecallResponse.status.BOOKED_ON,
    } as RecallResponse
    expect(isInCustody(recall)).toEqual(true)
  })

  it('returns false if assessment not started and not in custody at booking', () => {
    const recall = {
      inCustodyAtBooking: false,
      status: RecallResponse.status.BEING_BOOKED_ON,
    } as RecallResponse
    expect(isInCustody(recall)).toEqual(false)
  })

  it('returns inCustodyAtAssessment value if assessment in progress', () => {
    const recall = {
      inCustodyAtBooking: false,
      inCustodyAtAssessment: true,
      status: RecallResponse.status.IN_ASSESSMENT,
    } as RecallResponse
    expect(isInCustody(recall)).toEqual(true)
  })

  it('returns true if assessment complete and in custody at assessment, after not being in custody at booking', () => {
    const recall = {
      inCustodyAtBooking: false,
      inCustodyAtAssessment: true,
      status: RecallResponse.status.RECALL_NOTIFICATION_ISSUED,
    } as RecallResponse
    expect(isInCustody(recall)).toEqual(true)
  })

  it('returns false if assessment complete and not in custody at assessment, after not being in custody at booking', () => {
    const recall = {
      inCustodyAtBooking: false,
      inCustodyAtAssessment: false,
      status: RecallResponse.status.RECALL_NOTIFICATION_ISSUED,
    } as RecallResponse
    expect(isInCustody(recall)).toEqual(false)
  })

  it('returns true if assessment complete and in custody at booking', () => {
    const recall = {
      inCustodyAtBooking: true,
      status: RecallResponse.status.RECALL_NOTIFICATION_ISSUED,
    } as RecallResponse
    expect(isInCustody(recall)).toEqual(true)
  })

  it('uses AWAITING_RETURN_TO_CUSTODY status, if set', () => {
    const recall = {
      status: RecallResponse.status.AWAITING_RETURN_TO_CUSTODY,
      inCustodyAtAssessment: false,
    } as RecallResponse
    expect(isInCustody(recall)).toEqual(false)
  })
})
