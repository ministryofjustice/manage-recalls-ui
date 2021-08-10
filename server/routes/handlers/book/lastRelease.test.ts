// @ts-nocheck
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { lastRelease } from './lastRelease'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('lastRelease', () => {
  const nomsNumber = 'AA123AA'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const body = { lastReleasePrison: 'Belmarsh', year: '2021', month: '05', day: '20' }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('recall type', () => {
    it('should update fields and redirect to recall view', async () => {
      const recallDetails = { recallId, nomsNumber }

      updateRecall.mockReturnValueOnce(recallDetails)

      const req = mockPostRequest({
        params: { nomsNumber, recallId },
        body,
        originalUrl: `/persons/${nomsNumber}/recalls/${recallId}/last-release`,
      })
      const { res } = mockResponseWithAuthenticatedUser('')

      await lastRelease(req, res)

      expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/upload-documents`)
    })

    it('should reload the page if body is invalid', async () => {
      const recallDetails = { recallId, nomsNumber }
      const currentPageUrl = `/persons/${nomsNumber}/recalls/${recallId}/recall-type`

      updateRecall.mockReturnValueOnce(recallDetails)

      const req = mockPostRequest({
        originalUrl: currentPageUrl,
        params: { nomsNumber, recallId },
        body: { lastReleasePrison: '', year: '', month: '', day: '' },
      })
      const { res } = mockResponseWithAuthenticatedUser('')

      await lastRelease(req, res)

      expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
    })

    it('should return 400 if invalid noms number', async () => {
      await invalidAddRecallType(0 as unknown as string, recallId, { year: '2021', month: '05', day: '20' })
    })

    it('should return 400 if invalid recallId', async () => {
      await invalidAddRecallType(nomsNumber, 0 as unknown as string, { year: '2021', month: '05', day: '20' })
    })
  })
})

async function invalidAddRecallType(nomsNumber, recallId, body) {
  const req = mockPostRequest({
    params: { nomsNumber, recallId },
    body,
  })
  const { res } = mockResponseWithAuthenticatedUser('')

  await lastRelease(req, res)

  expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}`)
}
