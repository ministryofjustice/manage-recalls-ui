// @ts-nocheck
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../../testUtils/mockRequestUtils'
import { newGeneratedDocumentVersion } from './newGeneratedDocumentVersion'
import { generateRecallDocument, getRecall } from '../../../clients/manageRecallsApiClient'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'

jest.mock('../../../clients/manageRecallsApiClient')

describe('generatedDocumentVersionFormHandler', () => {
  const nomsNumber = 'A1234AB'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const basePath = `/persons/${nomsNumber}/recalls/${recallId}/`
  const originalUrl = `${basePath}generated-document-version?fromPage=view-recall`

  beforeEach(() => {
    // used to form the fileName
    ;(getRecall as jest.Mock).mockResolvedValue({
      firstName: 'John',
      lastName: 'Smith',
      bookingNumber: '4567',
      inCustodyAtBooking: true,
      status: RecallResponse.status.BOOKED_ON,
    })
  })
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should call the API and redirect to recall view', async () => {
    const requestBody = {
      details: 'Details changed',
      category: 'RECALL_NOTIFICATION',
    }
    const req = mockPostRequest({
      params: { nomsNumber, recallId },
      body: requestBody,
      originalUrl,
    })
    generateRecallDocument.mockResolvedValue({ documentId: '123' })
    const { res } = mockResponseWithAuthenticatedUser('')
    res.locals.urlInfo = {
      basePath,
      fromPage: 'view-recall',
    }

    await newGeneratedDocumentVersion(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}view-recall`)
  })

  it('should reload the page if detail is missing', async () => {
    const recallDetails = { recallId, nomsNumber }
    const requestBody = {
      category: 'RECALL_NOTIFICATION',
    }

    generateRecallDocument.mockResolvedValueOnce(recallDetails)

    const req = mockPostRequest({
      originalUrl,
      params: { nomsNumber, recallId },
      body: requestBody,
    })
    const { res } = mockResponseWithAuthenticatedUser('')
    res.locals.urlInfo = {
      basePath,
      fromPage: 'view-recall',
    }

    await newGeneratedDocumentVersion(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, `${originalUrl}&versionedCategoryName=RECALL_NOTIFICATION`)
  })

  it('should throw an error if category is invalid', async () => {
    const recallDetails = { recallId, nomsNumber }
    const requestBody = {
      category: 'LICENCE',
    }

    generateRecallDocument.mockResolvedValueOnce(recallDetails)

    const req = mockPostRequest({
      originalUrl,
      params: { nomsNumber, recallId },
      body: requestBody,
    })
    const { res } = mockResponseWithAuthenticatedUser('')
    res.locals.urlInfo = {
      basePath,
      fromPage: 'view-recall',
    }
    try {
      await newGeneratedDocumentVersion(req, res)
    } catch (err) {
      expect(err.message).toEqual('Invalid category')
    }
  })

  it('should reload the page if the API errors', async () => {
    const requestBody = {
      details: 'Details changed',
      category: 'RECALL_NOTIFICATION',
    }
    generateRecallDocument.mockRejectedValueOnce(new Error('API error'))
    const req = mockPostRequest({
      originalUrl,
      params: { nomsNumber, recallId },
      body: requestBody,
    })
    const { res } = mockResponseWithAuthenticatedUser('')
    res.locals.urlInfo = {
      basePath,
      fromPage: 'view-recall',
    }

    await newGeneratedDocumentVersion(req, res)

    expect(req.session.errors).toEqual([
      {
        name: 'saveError',
        text: 'An error occurred saving your changes',
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `${originalUrl}&versionedCategoryName=RECALL_NOTIFICATION`)
  })

  it('should redirect to fromPage if one is supplied in res.locals', async () => {
    const recallDetails = { recallId, nomsNumber }
    const requestBody = {
      details: 'Details changed',
      category: 'RECALL_NOTIFICATION',
    }

    generateRecallDocument.mockResolvedValueOnce(recallDetails)

    const req = mockPostRequest({
      params: { nomsNumber, recallId },
      body: requestBody,
    })
    const { res } = mockResponseWithAuthenticatedUser('')
    res.locals.urlInfo = {
      basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
      fromPage: 'dossier-recall',
      fromHash: 'generated-documents',
    }

    await newGeneratedDocumentVersion(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}dossier-recall#generated-documents`)
  })

  it('should recreate the recall notification if the revocation order is generated', async () => {
    const recallDetails = { recallId, nomsNumber }
    const requestBody = {
      details: 'Details changed',
      category: 'REVOCATION_ORDER',
    }

    generateRecallDocument.mockResolvedValueOnce(recallDetails)

    const req = mockPostRequest({
      params: { nomsNumber, recallId },
      body: requestBody,
    })
    const { res } = mockResponseWithAuthenticatedUser('token')
    res.locals.urlInfo = {
      basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
      fromPage: 'dossier-recall',
    }

    await newGeneratedDocumentVersion(req, res)
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
    const recallDetails = { recallId, nomsNumber }
    const requestBody = {
      details: 'Details changed',
      category: 'REVOCATION_ORDER',
      dossierExists: '1',
    }

    generateRecallDocument.mockResolvedValueOnce(recallDetails)

    const req = mockPostRequest({
      params: { nomsNumber, recallId },
      body: requestBody,
    })
    const { res } = mockResponseWithAuthenticatedUser('token')
    res.locals.urlInfo = {
      basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
      fromPage: 'dossier-recall',
    }

    await newGeneratedDocumentVersion(req, res)
    expect(generateRecallDocument).toHaveBeenNthCalledWith(
      3,
      '00000000-0000-0000-0000-000000000000',
      { category: 'DOSSIER', details: 'Details changed', fileName: 'SMITH JOHN 4567 RECALL DOSSIER.pdf' },
      'token'
    )
    expect(res.redirect).toHaveBeenCalledWith(303, `${basePath}dossier-recall`)
  })
})
