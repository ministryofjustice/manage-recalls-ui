// @ts-nocheck
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { handleRecallFormPost } from './handleRecallFormPost'
import { updateRecall } from '../../../clients/manageRecallsApiClient'
import { validatePolice } from '../book/helpers/validatePolice'
import { validateDecision } from '../assess/helpers/validateDecision'
import * as referenceDataExports from '../../../referenceData'
import { validateCustodyStatus } from '../book/helpers/validateCustodyStatus'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

const handler = handleRecallFormPost(validatePolice, 'issues-needs')

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  jest.spyOn(referenceDataExports, 'referenceData').mockReturnValue({
    policeForces: [
      {
        value: 'metropolitan',
        text: 'Metropolitan Police Service',
      },
    ],
  })
})

describe('handleRecallFormPost', () => {
  const nomsNumber = 'A1234AB'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const requestBody = {
    localPoliceForceId: 'metropolitan',
    localPoliceForceIdInput: 'Metropolitan Police Service',
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should update recall and redirect to recall view', async () => {
    const recallDetails = { recallId, nomsNumber }

    updateRecall.mockResolvedValueOnce(recallDetails)

    const req = mockPostRequest({
      params: { nomsNumber, recallId },
      body: requestBody,
    })
    const { res } = mockResponseWithAuthenticatedUser('')
    res.locals.urlInfo = {
      basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
    }

    await handler(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/issues-needs`)
  })

  it('should reload the page if the request body is invalid', async () => {
    const recallDetails = { recallId, nomsNumber }
    const currentPageUrl = `/persons/${nomsNumber}/recalls/${recallId}/prison-police`

    updateRecall.mockResolvedValueOnce(recallDetails)

    const req = mockPostRequest({
      originalUrl: currentPageUrl,
      params: { nomsNumber, recallId },
      body: {},
    })
    const { res } = mockResponseWithAuthenticatedUser('')
    res.locals.urlInfo = {
      basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
    }

    await handler(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
  })

  it('should reload the page if the API errors', async () => {
    const currentPageUrl = `/persons/${nomsNumber}/recalls/${recallId}/prison-police`

    updateRecall.mockRejectedValueOnce(new Error('API error'))
    const req = mockPostRequest({
      originalUrl: currentPageUrl,
      params: { nomsNumber, recallId },
      body: requestBody,
    })
    const { res } = mockResponseWithAuthenticatedUser('')
    res.locals.urlInfo = {
      basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
    }

    await handler(req, res)

    expect(req.session.errors).toEqual([
      {
        name: 'saveError',
        text: 'An error occurred saving your changes',
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
  })

  it('should use redirectToPage if one is returned from the validator function', async () => {
    const recallDetails = { recallId, nomsNumber }
    const requestHandler = handleRecallFormPost(validateDecision, 'assess-licence')

    updateRecall.mockResolvedValueOnce(recallDetails)

    const req = mockPostRequest({
      params: { nomsNumber, recallId },
      body: {
        agreeWithRecall: 'NO_STOP',
        agreeWithRecallDetailNo: 'Reasons',
      },
    })
    const { res } = mockResponseWithAuthenticatedUser('')
    res.locals.urlInfo = {
      basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
    }

    await requestHandler(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/assess-stop`)
  })

  it('should redirect to fromPage if one is supplied in res.locals', async () => {
    const recallDetails = { recallId, nomsNumber }
    const requestHandler = handleRecallFormPost(validateDecision, 'assess-licence')

    updateRecall.mockResolvedValueOnce(recallDetails)

    const req = mockPostRequest({
      params: { nomsNumber, recallId },
      body: {
        agreeWithRecall: 'YES',
        agreeWithRecallDetailYes: 'Reasons',
      },
    })
    const { res } = mockResponseWithAuthenticatedUser('')
    res.locals.urlInfo = {
      basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
      fromPage: 'check-answers',
    }

    await requestHandler(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/check-answers`)
  })

  it('should use fromPage over redirectToPage', async () => {
    const recallDetails = { recallId, nomsNumber }
    const requestHandler = handleRecallFormPost(validateCustodyStatus, 'licence-name')

    updateRecall.mockResolvedValueOnce(recallDetails)

    const req = mockPostRequest({
      params: { nomsNumber, recallId },
      body: {
        inCustody: 'YES',
      },
    })
    const { res } = mockResponseWithAuthenticatedUser('')
    res.locals.urlInfo = {
      basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
      fromPage: 'check-answers',
    }

    await requestHandler(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/check-answers`)
  })
})
