// @ts-nocheck
import { Response } from 'express'
import { mockReq, mockRes } from './testUtils/mockRequestUtils'
import { recallFormPost } from './recallFormPost'
import { updateRecall } from '../clients/manageRecallsApiClient'
import { validatePolice } from './book/validators/validatePolice'
import { validateAssessPrison } from './assess/validators/validatePrison'
import * as referenceDataExports from '../referenceData'
import { validateWarrantReference } from './assess/validators/validateWarrantReference'
import { updateAndUnassign } from './assess/helpers/updateAndUnassign'

jest.mock('../clients/manageRecallsApiClient')
jest.mock('./assess/helpers/updateAndUnassign')

const handler = recallFormPost(validatePolice)

describe('recallFormPost', () => {
  const recallId = '00000000-0000-0000-0000-000000000000'
  const requestBody = {
    localPoliceForceId: 'metropolitan',
    localPoliceForceIdInput: 'Metropolitan Police Service',
  }
  let res: Response

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
    res = mockRes({
      locals: {
        urlInfo: {
          basePath: `/recalls/${recallId}/`,
        },
      },
    })
  })

  it('should update recall and redirect to recall view', async () => {
    const recallDetails = { recallId }
    updateRecall.mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recallId },
      body: requestBody,
    })
    await handler(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, `/recalls/${recallId}/issues-needs`)
  })

  it('should reload the page if the request body is invalid', async () => {
    const recallDetails = { recallId }
    const currentPageUrl = `/recalls/${recallId}/prison-police`
    updateRecall.mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      originalUrl: currentPageUrl,
      params: { recallId },
      body: {},
    })
    await handler(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
  })

  it('should reload the page if the API errors', async () => {
    const currentPageUrl = `/recalls/${recallId}/prison-police`
    updateRecall.mockRejectedValueOnce(new Error('API error'))
    const req = mockReq({
      method: 'POST',
      originalUrl: currentPageUrl,
      params: { recallId },
      body: requestBody,
    })
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
    const recallDetails = { recallId }
    const requestHandler = recallFormPost(validateAssessPrison)
    updateRecall.mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recallId },
      body: {
        currentPrison: 'KTI',
      },
    })
    await requestHandler(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, `/recalls/${recallId}/assess-download`)
  })

  it('calls an afterRecallUpdate function, if supplied', async () => {
    const recallDetails = { recallId }
    updateRecall.mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      params: { recallId },
      body: {
        warrantReferenceNumber: '04RC/6457367A74325',
      },
      method: 'POST',
    })
    ;(updateAndUnassign as jest.Mock).mockResolvedValue(undefined)
    await recallFormPost(validateWarrantReference, updateAndUnassign)(req, res)

    expect(updateAndUnassign).toHaveBeenCalled()
  })
})
