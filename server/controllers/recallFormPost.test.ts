// @ts-nocheck
import { mockPostRequest, mockResponseWithAuthenticatedUser, mockReq, mockRes } from './testUtils/mockRequestUtils'
import { recallFormPost } from './recallFormPost'
import { updateRecall } from '../clients/manageRecallsApiClient'
import { validatePolice } from './book/validators/validatePolice'
import { validateDecision } from './assess/validators/validateDecision'
import * as referenceDataExports from '../referenceData'
import { validateWarrantReference } from './assess/validators/validateWarrantReference'
import { saveWarrantReference } from './assess/helpers/saveWarrantReference'

jest.mock('../clients/manageRecallsApiClient')
jest.mock('./assess/helpers/saveWarrantReference')

const handler = recallFormPost(validatePolice)

describe('recallFormPost', () => {
  const nomsNumber = 'A1234AB'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const requestBody = {
    localPoliceForceId: 'metropolitan',
    localPoliceForceIdInput: 'Metropolitan Police Service',
  }

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
    const requestHandler = recallFormPost(validateDecision)

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

  it('calls an afterRecallUpdate function, if supplied', async () => {
    const recallDetails = { recallId, nomsNumber }
    updateRecall.mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      params: { nomsNumber, recallId },
      body: {
        warrantReferenceNumber: '04RC/6457367A74325',
      },
      method: 'POST',
    })
    const res = mockRes({
      locals: {
        urlInfo: {
          basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
        },
      },
    })
    ;(saveWarrantReference as jest.Mock).mockResolvedValue(undefined)
    await recallFormPost(validateWarrantReference, saveWarrantReference)(req, res)

    expect(saveWarrantReference).toHaveBeenCalled()
  })
})
