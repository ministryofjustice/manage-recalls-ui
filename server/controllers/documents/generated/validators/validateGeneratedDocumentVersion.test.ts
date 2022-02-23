import { validateGeneratedDocumentVersion } from './validateGeneratedDocumentVersion'
import { getRecall } from '../../../../clients/manageRecallsApiClient'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'

jest.mock('../../../../clients/manageRecallsApiClient')

describe('validateGeneratedDocumentVersion', () => {
  const recallId = '123'
  const token = 'token'
  it('returns an error if details is missing, and no valuesToSave', async () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = await validateGeneratedDocumentVersion({
      requestBody,
      recallId,
      token,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      details: undefined,
    })
    expect(errors).toEqual([
      {
        href: '#details',
        name: 'details',
        text: 'Provide more detail',
      },
    ])
  })

  it('returns valuesToSave if details is present, and no errors', async () => {
    const requestBody = {
      details: 'Changed',
      category: 'RECALL_NOTIFICATION',
    }
    ;(getRecall as jest.Mock).mockResolvedValue({
      firstName: 'John',
      lastName: 'Smith',
      bookingNumber: '4567',
      inCustodyAtBooking: true,
      status: RecallResponse.status.BOOKED_ON,
    })
    const { errors, valuesToSave } = await validateGeneratedDocumentVersion({ requestBody, recallId, token })
    expect(valuesToSave).toEqual({ ...requestBody, fileName: 'IN CUSTODY RECALL SMITH JOHN 4567.pdf' })

    expect(errors).toBeUndefined()
  })
})
