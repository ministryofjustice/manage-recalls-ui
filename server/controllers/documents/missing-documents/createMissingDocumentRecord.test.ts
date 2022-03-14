import { addMissingDocumentRecord, getRecall } from '../../../clients/manageRecallsApiClient'
import { createMissingDocumentRecord } from './createMissingDocumentRecord'
import { User } from '../../../@types'

jest.mock('../../../clients/manageRecallsApiClient')
jest.mock('../upload/helpers/uploadStorage')

describe('addMissingDocumentRecordForm', () => {
  const recallId = '789'
  const valuesToSave = {
    missingDocumentsDetail: 'Chased by email',
  }
  const user = { token: 'token' } as User

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
})
