import { isInCustody, isRescindInProgress, recallStatusTagProperties, throwIfStatusInvalid } from './recallStatus'
import { RecallResponse } from '../../@types/manage-recalls-api/models/RecallResponse'

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
      status: RecallResponse.status.AWAITING_DOSSIER_CREATION,
    } as RecallResponse
    expect(isInCustody(recall)).toEqual(true)
  })

  it('returns false if assessment complete and not in custody at assessment, after not being in custody at booking', () => {
    const recall = {
      inCustodyAtBooking: false,
      inCustodyAtAssessment: false,
      status: RecallResponse.status.AWAITING_RETURN_TO_CUSTODY,
    } as RecallResponse
    expect(isInCustody(recall)).toEqual(false)
  })

  it('returns true if assessment complete and in custody at booking', () => {
    const recall = {
      inCustodyAtBooking: true,
      status: RecallResponse.status.AWAITING_DOSSIER_CREATION,
    } as RecallResponse
    expect(isInCustody(recall)).toEqual(true)
  })

  it('returns true if assessment complete and person returned to custody', () => {
    const recall = {
      inCustodyAtBooking: false,
      inCustodyAtAssessment: false,
      status: RecallResponse.status.AWAITING_DOSSIER_CREATION,
      returnedToCustodyDateTime: '2021-12-10T13:45:33.000Z',
    } as RecallResponse
    expect(isInCustody(recall)).toEqual(true)
  })
})

describe('recallStatusTagProperties', () => {
  it('returns the correct properties for a given status', () => {
    expect(recallStatusTagProperties({ status: RecallResponse.status.DOSSIER_ISSUED } as RecallResponse)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Dossier complete',
      classes: `govuk-tag--green`,
    })
    expect(
      recallStatusTagProperties({ status: RecallResponse.status.AWAITING_DOSSIER_CREATION } as RecallResponse)
    ).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Assessment complete',
      classes: `govuk-tag--orange`,
    })
    expect(
      recallStatusTagProperties({ status: RecallResponse.status.ASSESSED_NOT_IN_CUSTODY } as RecallResponse)
    ).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Assessment complete',
      classes: `govuk-tag--orange`,
    })
    expect(recallStatusTagProperties({ status: RecallResponse.status.DOSSIER_IN_PROGRESS } as RecallResponse)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Dossier in progress',
      classes: `govuk-tag--orange`,
    })
    expect(recallStatusTagProperties({ status: RecallResponse.status.BEING_BOOKED_ON } as RecallResponse)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Booking in progress',
      classes: `govuk-tag--orange`,
    })
    expect(recallStatusTagProperties({ status: RecallResponse.status.BOOKED_ON } as RecallResponse)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Booking complete',
      classes: `govuk-tag--orange`,
    })
    expect(recallStatusTagProperties({ status: RecallResponse.status.IN_ASSESSMENT } as RecallResponse)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Assessment in progress',
      classes: `govuk-tag--orange`,
    })
    expect(recallStatusTagProperties({ status: RecallResponse.status.STOPPED } as RecallResponse)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Stopped',
      classes: `govuk-tag--red`,
    })
    expect(
      recallStatusTagProperties({ status: RecallResponse.status.AWAITING_RETURN_TO_CUSTODY } as RecallResponse)
    ).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Awaiting return to custody',
      classes: `govuk-tag--orange`,
    })
    expect(recallStatusTagProperties({ status: RecallResponse.status.AWAITING_PART_B } as RecallResponse)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Awaiting part B',
      classes: `govuk-tag--orange`,
    })
    expect(
      recallStatusTagProperties({
        status: RecallResponse.status.AWAITING_RETURN_TO_CUSTODY,
        rescindRecords: [
          {
            rescindRecordId: '123',
            requestEmailId: '123',
            requestEmailFileName: 'rescind-request.msg',
            requestEmailReceivedDate: '2020-12-08',
            requestDetails: 'Rescind was requested by email',
            version: 1,
          },
        ],
      } as RecallResponse)
    ).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Rescind in progress',
      classes: `govuk-tag--orange`,
    })
    expect(
      recallStatusTagProperties({ status: RecallResponse.status.AWAITING_SECONDARY_DOSSIER_CREATION } as RecallResponse)
    ).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Ready for review',
      classes: `govuk-tag--orange`,
    })
    expect(
      recallStatusTagProperties({ status: RecallResponse.status.SECONDARY_DOSSIER_IN_PROGRESS } as RecallResponse)
    ).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Preparation in progress',
      classes: `govuk-tag--orange`,
    })
  })
})

describe('check all statuses', () => {
  it('doesnt error for all statuses', () => {
    Object.keys(RecallResponse.status).forEach(recallStatus => {
      expect(() => throwIfStatusInvalid(recallStatus as RecallResponse.status)).not.toThrow()
    })
  })

  it('None of the statuses return `Unknown status`', () => {
    Object.keys(RecallResponse.status).forEach(recallStatus =>
      expect(recallStatusTagProperties({ status: recallStatus } as RecallResponse).text).not.toEqual('Unknown status')
    )
  })
})

describe('isRescindInProgress', () => {
  it('returns false if there are no rescind records', () => {
    expect(isRescindInProgress({} as RecallResponse)).toEqual(false)
  })

  it('returns true if the latest rescind record has no decision details', () => {
    const recall = {
      rescindRecords: [
        {
          requestEmailId: '123',
          requestEmailFileName: 'rescind-request.msg',
          requestEmailReceivedDate: '2020-12-08',
          requestDetails: 'Rescind was requested by email',
          version: 2,
        },
        {
          rescindRecordId: '123',
          requestEmailId: '123',
          requestEmailFileName: 'rescind-request.msg',
          requestEmailReceivedDate: '2020-12-08',
          requestDetails: 'Rescind was requested by email',
          decisionDetails: 'Rescind was confirmed by email',
          version: 1,
        },
      ],
    }
    expect(isRescindInProgress(recall as RecallResponse)).toEqual(true)
  })

  it('returns false if the latest rescind record was approved', () => {
    const recall = {
      rescindRecords: [
        {
          requestEmailId: '123',
          requestEmailFileName: 'rescind-request.msg',
          requestEmailReceivedDate: '2020-12-08',
          requestDetails: 'Rescind was requested by email',
          decisionDetails: 'Rescind was confirmed by email',
          approved: true,
          version: 2,
        },
        {
          rescindRecordId: '123',
          requestEmailId: '123',
          requestEmailFileName: 'rescind-request.msg',
          requestEmailReceivedDate: '2020-12-08',
          requestDetails: 'Rescind was requested by email',
          version: 1,
        },
      ],
    }
    expect(isRescindInProgress(recall as RecallResponse)).toEqual(false)
  })
})
