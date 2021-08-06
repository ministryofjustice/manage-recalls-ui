// @ts-nocheck
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { recallRequestReceivedFormHandler } from './recallRequestReceived'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('recallRequestReceivedFormHandler', () => {
  const nomsNumber = 'AA123AA'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const recallEmailReceivedDateTime = { day: '10', month: '05', year: '2021', hour: '05', minute: '3' }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('recall email request received', () => {
    it('should update recall length and redirect to recall view', async () => {
      const recallDetails = { recallId, nomsNumber }

      updateRecall.mockReturnValueOnce(recallDetails)

      const req = mockPostRequest({
        params: { nomsNumber, recallId },
        body: { day: '10', month: '05', year: '2021', hour: '05', minute: '3' },
      })
      const { res } = mockResponseWithAuthenticatedUser('')

      await recallRequestReceivedFormHandler(req, res)

      expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/recall-type`)
    })

    it('should reload the page if recallLength is invalid', async () => {
      const recallDetails = { recallId, nomsNumber }
      const currentPageUrl = `/persons/${nomsNumber}/recalls/${recallId}/recall-type`

      updateRecall.mockReturnValueOnce(recallDetails)

      const req = mockPostRequest({
        originalUrl: currentPageUrl,
        params: { nomsNumber, recallId },
        body: { day: '10', month: '05', year: '3021', hour: '05', minute: '3' },
      })
      const { res } = mockResponseWithAuthenticatedUser('')

      await recallRequestReceivedFormHandler(req, res)

      expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
    })

    it('should return 400 if invalid noms number', async () => {
      await invalidrecallRequestReceived(0 as unknown as string, recallId, recallEmailReceivedDateTime)
    })

    it('should return 400 if invalid recallId', async () => {
      await invalidrecallRequestReceived(nomsNumber, 0 as unknown as string, recallEmailReceivedDateTime)
    })
  })
})

async function invalidrecallRequestReceived(nomsNumber, recallId, recallEmailReceivedDateTime) {
  const req = mockPostRequest({
    params: { nomsNumber, recallId },
    body: recallEmailReceivedDateTime,
  })
  const { res } = mockResponseWithAuthenticatedUser('')

  await recallRequestReceivedFormHandler(req, res)

  expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}`)
}
