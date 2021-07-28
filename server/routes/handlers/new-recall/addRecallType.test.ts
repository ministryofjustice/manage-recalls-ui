// @ts-nocheck
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { addRecallType } from './addRecallType'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('addRecallType', () => {
  const nomsNumber = 'AA123AA'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const recommendedRecallLength = '28'

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('recall type', () => {
    it('should update recall length and redirect to recall view', async () => {
      const recallDetails = { recallId, nomsNumber }

      updateRecall.mockReturnValueOnce(recallDetails)

      const req = mockPostRequest({ params: { nomsNumber, recallId }, body: { recommendedRecallLength } })
      const { res } = mockResponseWithAuthenticatedUser('')

      await addRecallType(req, res)

      expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/upload-documents`)
    })

    it('should return 400 if invalid noms number', async () => {
      await addRecallTypeAndExpectBadRequestFor(0 as unknown as string, recallId, recommendedRecallLength)
    })

    it('should return 400 if invalid recallId', async () => {
      await addRecallTypeAndExpectBadRequestFor(nomsNumber, 0 as unknown as string, recommendedRecallLength)
    })

    it('should return 400 if invalid recommendedRecallLength', async () => {
      await addRecallTypeAndExpectBadRequestFor(nomsNumber, recallId, '')
    })
  })
})

async function addRecallTypeAndExpectBadRequestFor(nomsNumber, recallId, recommendedRecallLength) {
  const req = mockPostRequest({
    params: { nomsNumber, recallId },
    body: { recommendedRecallLength },
  })
  const { res } = mockResponseWithAuthenticatedUser('')

  await addRecallType(req, res)

  expect(res.sendStatus).toHaveBeenCalledWith(400)
}
