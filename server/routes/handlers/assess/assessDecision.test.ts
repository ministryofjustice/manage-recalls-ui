import { assessDecisionFormHandler } from './assessDecision'
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('assessDecisionFormHandler', () => {
  it('should update recall and redirect to next page', async () => {
    const nomsNumber = 'AA123AA'
    const recallId = '00000000-0000-0000-0000-000000000000'
    const nextPageUrl = `/persons/${nomsNumber}/recalls/${recallId}/assess-confirmation`

    ;(updateRecall as jest.Mock).mockReturnValueOnce({ recallId, nomsNumber })

    const req = mockPostRequest({
      originalUrl: nextPageUrl,
      params: { nomsNumber, recallId },
      body: { agreeWithRecall: 'NO', agreeWithRecallDetail: 'Reasons..' },
    })
    const { res } = mockResponseWithAuthenticatedUser('')

    await assessDecisionFormHandler(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, nextPageUrl)
  })

  it('should reload the page if invalid data is sent', async () => {
    const nomsNumber = 'AA123AA'
    const recallId = '00000000-0000-0000-0000-000000000000'
    const currentPageUrl = `/persons/${nomsNumber}/recalls/${recallId}/assess-decision`

    ;(updateRecall as jest.Mock).mockReturnValueOnce({ recallId, nomsNumber })

    const req = mockPostRequest({
      originalUrl: currentPageUrl,
      params: { nomsNumber, recallId },
      body: {},
    })
    const { res } = mockResponseWithAuthenticatedUser('')

    await assessDecisionFormHandler(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
  })
})
