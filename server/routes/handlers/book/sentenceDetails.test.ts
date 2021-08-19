// @ts-nocheck
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { sentenceDetails } from './sentenceDetails'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('lastRelease', () => {
  const nomsNumber = 'AA123AA'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const body = {
    lastReleasePrison: 'Belmarsh',
    lastReleaseDateYear: '2021',
    lastReleaseDateMonth: '05',
    lastReleaseDateDay: '20',
    sentenceDateYear: '2020',
    sentenceDateMonth: '03',
    sentenceDateDay: '10',
    licenceExpiryDateYear: '2020',
    licenceExpiryDateMonth: '08',
    licenceExpiryDateDay: '4',
    sentenceExpiryDateYear: '2022',
    sentenceExpiryDateMonth: '10',
    sentenceExpiryDateDay: '20',
    sentencingCourt: 'Birmingham',
    indexOffence: 'Assault',
    conditionalReleaseDateYear: '2021',
    conditionalReleaseDateMonth: '10',
    conditionalReleaseDateDay: '4',
    sentenceLengthYears: '2',
    sentenceLengthMonths: '',
    sentenceLengthDays: '',
    bookingNumber: 'A123456',
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('last release details', () => {
    it('should update fields and redirect to recall view', async () => {
      const recallDetails = { recallId, nomsNumber }

      updateRecall.mockReturnValueOnce(recallDetails)

      const req = mockPostRequest({
        params: { nomsNumber, recallId },
        body,
        originalUrl: `/persons/${nomsNumber}/recalls/${recallId}/last-release`,
      })
      const { res } = mockResponseWithAuthenticatedUser('')

      await sentenceDetails(req, res)

      expect(updateRecall.mock.calls[0][1]).toEqual({
        conditionalReleaseDate: '2021-10-04',
        indexOffence: 'Assault',
        lastReleaseDate: '2021-05-20',
        lastReleasePrison: 'Belmarsh',
        licenceExpiryDate: '2020-08-04',
        sentenceDate: '2020-03-10',
        sentenceExpiryDate: '2022-10-20',
        sentencingCourt: 'Birmingham',
        sentenceLength: {
          years: 2,
        },
        bookingNumber: 'A123456',
      })
      expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/prison-police`)
    })

    it('should reload the page if body is invalid', async () => {
      const recallDetails = { recallId, nomsNumber }
      const currentPageUrl = `/persons/${nomsNumber}/recalls/${recallId}/last-release`

      updateRecall.mockReturnValueOnce(recallDetails)

      const req = mockPostRequest({
        originalUrl: currentPageUrl,
        params: { nomsNumber, recallId },
        body: { lastReleasePrison: '', lastReleaseDateYear: '', lastReleaseDateMonth: '', lastReleaseDateDay: '' },
      })
      const { res } = mockResponseWithAuthenticatedUser('')

      await sentenceDetails(req, res)

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

  await sentenceDetails(req, res)

  expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}`)
}
