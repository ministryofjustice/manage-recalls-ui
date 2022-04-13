// @ts-nocheck
import { NextFunction, Response } from 'express'
import { mockReq, mockRes } from '../../testUtils/mockRequestUtils'
import { newGeneratedDocumentVersion } from './newGeneratedDocumentVersion'
import { generateRecallDocument, getRecall } from '../../../clients/manageRecallsApiClient'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'

jest.mock('../../../clients/manageRecallsApiClient')

describe('generatedDocumentVersionFormHandler', () => {
  const recallId = '00000000-0000-0000-0000-000000000000'
  const basePath = `/recalls/${recallId}/`
  const originalUrl = `${basePath}generated-document-version?fromPage=view-recall`
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    // used to form the fileName
    ;(getRecall as jest.Mock).mockResolvedValue({
      firstName: 'John',
      lastName: 'Smith',
      bookingNumber: '4567',
      inCustodyAtBooking: true,
      status: RecallResponse.status.BOOKED_ON,
    })
    res = mockRes({
      token: 'token',
      locals: {
        urlInfo: {
          basePath,
          fromPage: 'view-recall',
        },
      },
    })
    next = jest.fn()
  })

  it('should call the API and redirect to recall view', async () => {
    const requestBody = {
      details: 'Details changed',
      category: 'RECALL_NOTIFICATION',
    }
    const req = mockReq({
      method: 'POST',
      params: { recallId },
      body: requestBody,
      originalUrl,
    })
    generateRecallDocument.mockResolvedValue({ documentId: '123' })
    await newGeneratedDocumentVersion(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}view-recall`)
  })

  it('should reload the page if detail is missing', async () => {
    const recallDetails = { recallId }
    const requestBody = {
      category: 'RECALL_NOTIFICATION',
    }

    generateRecallDocument.mockResolvedValueOnce(recallDetails)

    const req = mockReq({
      method: 'POST',
      originalUrl,
      params: { recallId },
      body: requestBody,
    })
    res.locals.urlInfo = {
      basePath,
      fromPage: 'view-recall',
    }

    await newGeneratedDocumentVersion(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `${originalUrl}&versionedCategoryName=RECALL_NOTIFICATION`)
  })

  it('should call next if category is invalid', async () => {
    const recallDetails = { recallId }
    const requestBody = {
      category: 'LICENCE',
    }

    generateRecallDocument.mockResolvedValueOnce(recallDetails)

    const req = mockReq({
      method: 'POST',
      originalUrl,
      params: { recallId },
      body: requestBody,
    })
    await newGeneratedDocumentVersion(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it('should reload the page if the API errors', async () => {
    const requestBody = {
      details: 'Details changed',
      category: 'RECALL_NOTIFICATION',
    }
    generateRecallDocument.mockRejectedValueOnce(new Error('API error'))
    const req = mockReq({
      method: 'POST',
      originalUrl,
      params: { recallId },
      body: requestBody,
    })
    res.locals.env = 'PRODUCTION'

    await newGeneratedDocumentVersion(req, res, next)

    expect(req.session.errors).toEqual([
      {
        name: 'saveError',
        text: 'An error occurred saving your changes',
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `${originalUrl}&versionedCategoryName=RECALL_NOTIFICATION`)
  })

  it('should redirect to fromPage if one is supplied in res.locals', async () => {
    const recallDetails = { recallId }
    const requestBody = {
      details: 'Details changed',
      category: 'RECALL_NOTIFICATION',
    }

    generateRecallDocument.mockResolvedValueOnce(recallDetails)

    const req = mockReq({
      method: 'POST',
      params: { recallId },
      body: requestBody,
    })
    res.locals.urlInfo.fromPage = 'dossier-recall'
    res.locals.urlInfo.fromHash = 'generated-documents'

    await newGeneratedDocumentVersion(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}dossier-recall#generated-documents`)
  })

  it('should recreate the recall notification if the revocation order is generated', async () => {
    const recallDetails = { recallId }
    const requestBody = {
      details: 'Details changed',
      category: 'REVOCATION_ORDER',
    }

    generateRecallDocument.mockResolvedValueOnce(recallDetails)

    const req = mockReq({
      method: 'POST',
      params: { recallId },
      body: requestBody,
    })
    res.locals.urlInfo.fromPage = 'dossier-recall'

    await newGeneratedDocumentVersion(req, res, next)
    expect(generateRecallDocument).toHaveBeenNthCalledWith(
      1,
      '00000000-0000-0000-0000-000000000000',
      { category: 'REVOCATION_ORDER', details: 'Details changed', fileName: 'SMITH JOHN 4567 REVOCATION ORDER.pdf' },
      'token'
    )
    expect(generateRecallDocument).toHaveBeenNthCalledWith(
      2,
      '00000000-0000-0000-0000-000000000000',
      {
        category: 'RECALL_NOTIFICATION',
        details: 'Details changed',
        fileName: 'IN CUSTODY RECALL SMITH JOHN 4567.pdf',
      },
      'token'
    )
    // dossier didn't already exist, so should not be recreated
    expect(generateRecallDocument).not.toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000000',
      { category: 'DOSSIER', details: 'Details changed' },
      'token'
    )
    expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}dossier-recall`)
  })

  it('should recreate the dossier if one already exists and the revocation order is generated', async () => {
    const recallDetails = { recallId }
    const requestBody = {
      details: 'Details changed',
      category: 'REVOCATION_ORDER',
      dossierExists: '1',
    }

    generateRecallDocument.mockResolvedValueOnce(recallDetails)

    const req = mockReq({
      method: 'POST',
      params: { recallId },
      body: requestBody,
    })
    res.locals.urlInfo.fromPage = 'dossier-recall'

    await newGeneratedDocumentVersion(req, res, next)
    expect(generateRecallDocument).toHaveBeenNthCalledWith(
      3,
      '00000000-0000-0000-0000-000000000000',
      { category: 'DOSSIER', details: 'Details changed', fileName: 'SMITH JOHN 4567 RECALL DOSSIER.pdf' },
      'token'
    )
    expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}dossier-recall`)
  })

  it('calls error middleware if an error occurs', async () => {
    const req = mockReq({
      method: 'POST',
      params: { recallId },
      body: {
        details: 'Details changed',
        category: 'REVOCATION_ORDER',
      },
    })
    const err = new Error('test')
    ;(getRecall as jest.Mock).mockRejectedValue(err)
    await newGeneratedDocumentVersion(req, res, next)
    expect(next).toHaveBeenCalledWith(err)
  })
})
