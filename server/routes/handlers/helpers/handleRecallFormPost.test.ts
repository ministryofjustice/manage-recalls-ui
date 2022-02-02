// @ts-nocheck
import { mockPostRequest, mockResponseWithAuthenticatedUser, mockReq, mockRes } from '../../testutils/mockRequestUtils'
import { handleRecallFormPost } from './handleRecallFormPost'
import { updateRecall } from '../../../clients/manageRecallsApiClient'
import { validatePolice } from '../book/helpers/validatePolice'
import { validateDecision } from '../assess/helpers/validateDecision'
import * as referenceDataExports from '../../../referenceData'
import { validateWarrantReference } from '../assess/helpers/validateWarrantReference'
import { afterWarrantReferenceSaved } from '../assess/helpers/afterWarrantReferenceSaved'

jest.mock('../../../clients/manageRecallsApiClient')
jest.mock('../assess/helpers/afterWarrantReferenceSaved')

const handler = handleRecallFormPost(validatePolice)

describe('handleRecallFormPost', () => {
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
    const requestHandler = handleRecallFormPost(validateDecision)

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
    ;(afterWarrantReferenceSaved as jest.Mock).mockResolvedValue(undefined)
    await handleRecallFormPost(validateWarrantReference, afterWarrantReferenceSaved)(req, res)

    expect(afterWarrantReferenceSaved).toHaveBeenCalled()
  })
})
