import { addMissingDocumentRecord, getRecall, assignUserToRecall } from '../../../clients/manageRecallsApiClient'
import { createMissingDocumentRecord } from './createMissingDocumentRecord'
import { User } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'

jest.mock('../../../clients/manageRecallsApiClient')
jest.mock('../upload/helpers/uploadStorage')

describe('addMissingDocumentRecordForm', () => {
  const recallId = '789'
  const valuesToSave = {
    missingDocumentsDetail: 'Chased by email',
  }
  const user = { uuid: '123', token: 'token' } as User

  afterEach(() => jest.resetAllMocks())

  it('saves a list of missing document categories to the API', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'PreCons Wesley Holt.pdf',
        },
      ],
    })
    ;(addMissingDocumentRecord as jest.Mock).mockResolvedValue({
      status: 201,
    })

    await createMissingDocumentRecord({ recallId, valuesToSave, user })
    expect((addMissingDocumentRecord as jest.Mock).mock.calls[0][0].categories).toEqual([
      'PART_A_RECALL_REPORT',
      'LICENCE',
      'OASYS_RISK_ASSESSMENT',
    ])
  })

  it('assigns the user to the recall if one of the missing documents is part B', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      status: RecallResponse.status.AWAITING_PART_B,
      partBDueDate: '2020-01-01',
      documents: [
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'PreCons Wesley Holt.pdf',
        },
      ],
    })
    ;(addMissingDocumentRecord as jest.Mock).mockResolvedValue({
      status: 201,
    })

    await createMissingDocumentRecord({ recallId, valuesToSave, user })
    expect(assignUserToRecall as jest.Mock).toHaveBeenCalledWith(recallId, user.uuid, user.token)
  })
})
