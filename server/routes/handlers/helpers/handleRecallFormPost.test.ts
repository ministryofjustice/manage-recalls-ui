// @ts-nocheck
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { handleRecallFormPost } from './handleRecallFormPost'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { validateRecallRequestReceived } from '../book/helpers/validateRecallRequestReceived'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

const handler = handleRecallFormPost(validateRecallRequestReceived, 'last-release')

describe('handleRecallFormPost', () => {
  const nomsNumber = 'AA123AA'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const recallEmailReceivedDateTime = {
    recallEmailReceivedDateTimeDay: '10',
    recallEmailReceivedDateTimeMonth: '05',
    recallEmailReceivedDateTimeYear: '2021',
    recallEmailReceivedDateTimeHour: '05',
    recallEmailReceivedDateTimeMinute: '3',
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('recall email request received', () => {
    it('should update recall length and redirect to recall view', async () => {
      const recallDetails = { recallId, nomsNumber }

      updateRecall.mockReturnValueOnce(recallDetails)

      const req = mockPostRequest({
        params: { nomsNumber, recallId },
        body: {
          recallEmailReceivedDateTimeDay: '10',
          recallEmailReceivedDateTimeMonth: '05',
          recallEmailReceivedDateTimeYear: '2021',
          recallEmailReceivedDateTimeHour: '05',
          recallEmailReceivedDateTimeMinute: '3',
        },
      })
      const { res } = mockResponseWithAuthenticatedUser('')

      await handler(req, res)

      expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/last-release`)
    })

    it('should reload the page if the date is invalid', async () => {
      const recallDetails = { recallId, nomsNumber }
      const currentPageUrl = `/persons/${nomsNumber}/recalls/${recallId}/request-received`

      updateRecall.mockReturnValueOnce(recallDetails)

      const req = mockPostRequest({
        originalUrl: currentPageUrl,
        params: { nomsNumber, recallId },
        body: {
          recallEmailReceivedDateTimeDay: '10',
          recallEmailReceivedDateTimeMonth: '05',
          recallEmailReceivedDateTimeYear: '',
          recallEmailReceivedDateTimeHour: '05',
          recallEmailReceivedDateTimeMinute: '3',
        },
      })
      const { res } = mockResponseWithAuthenticatedUser('')

      await handler(req, res)

      expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
    })

    it('should return 404 if invalid noms number', async () => {
      await invalidrecallRequestReceived(0 as unknown as string, recallId, recallEmailReceivedDateTime)
    })

    it('should return 404 if invalid recallId', async () => {
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

  await handler(req, res)

  expect(res.sendStatus).toHaveBeenCalledWith(400)
}
