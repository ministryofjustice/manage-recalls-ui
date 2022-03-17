import { NextFunction, Request, Response } from 'express'
import { createGeneratedDocument } from './createGeneratedDocument'
import { generateRecallDocument, getDocumentCategoryHistory, getRecall } from '../../../clients/manageRecallsApiClient'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'

jest.mock('../../../clients/manageRecallsApiClient')

const recallId = '123'
const documentId = '123'
const userToken = '000'

describe('createGeneratedDocument', () => {
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = { params: { recallId, documentId }, query: {} } as unknown as Request
    res = {
      locals: { user: { token: userToken } },
      contentType: jest.fn(),
      header: jest.fn(),
      send: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response
    next = jest.fn()
  })

  afterEach(() => jest.resetAllMocks())

  it("creates a new dossier if one doesn't already exist", async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      firstName: 'John',
      lastName: 'Smith',
      bookingNumber: '4567',
      inCustodyAtBooking: true,
      status: RecallResponse.status.BOOKED_ON,
    })
    req.query.category = 'DOSSIER'
    ;(getDocumentCategoryHistory as jest.Mock).mockResolvedValue([])
    ;(generateRecallDocument as jest.Mock).mockResolvedValue({ documentId })
    await createGeneratedDocument(req, res, next)
    expect(generateRecallDocument).toHaveBeenCalledWith(
      recallId,
      { category: 'DOSSIER', fileName: 'SMITH JOHN 4567 RECALL DOSSIER.pdf' },
      userToken
    )
    expect(res.locals.documentId).toBe(documentId)
  })

  it("creates a new letter to prison if one doesn't already exist", async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      firstName: 'John',
      lastName: 'Smith',
      bookingNumber: '4567',
      inCustodyAtBooking: true,
      status: RecallResponse.status.BOOKED_ON,
    })
    req.query.category = 'LETTER_TO_PRISON'
    ;(getDocumentCategoryHistory as jest.Mock).mockResolvedValue([])
    ;(generateRecallDocument as jest.Mock).mockResolvedValue({ documentId })
    await createGeneratedDocument(req, res, next)
    expect(generateRecallDocument).toHaveBeenCalledWith(
      recallId,
      { category: 'LETTER_TO_PRISON', fileName: 'SMITH JOHN 4567 LETTER TO PRISON.pdf' },
      userToken
    )
    expect(res.locals.documentId).toBe(documentId)
  })

  it("creates a new letter to probation if one doesn't already exist", async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      firstName: 'John',
      lastName: 'Smith',
      bookingNumber: '4567',
      inCustodyAtBooking: true,
      status: RecallResponse.status.BOOKED_ON,
    })
    req.query.category = 'LETTER_TO_PROBATION'
    ;(getDocumentCategoryHistory as jest.Mock).mockResolvedValue([])
    ;(generateRecallDocument as jest.Mock).mockResolvedValue({ documentId })
    await createGeneratedDocument(req, res, next)
    expect(generateRecallDocument).toHaveBeenCalledWith(
      recallId,
      { category: 'LETTER_TO_PROBATION', fileName: 'SMITH JOHN 4567 LETTER TO PROBATION.pdf' },
      userToken
    )
    expect(res.locals.documentId).toBe(documentId)
  })

  it("creates a new recall notification if one doesn't already exist", async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      firstName: 'John',
      lastName: 'Smith',
      bookingNumber: '4567',
      inCustodyAtBooking: true,
      status: RecallResponse.status.BOOKED_ON,
    })
    req.query.category = 'RECALL_NOTIFICATION'
    ;(getDocumentCategoryHistory as jest.Mock).mockResolvedValue([])
    ;(generateRecallDocument as jest.Mock).mockResolvedValue({ documentId })
    await createGeneratedDocument(req, res, next)
    expect(generateRecallDocument).toHaveBeenCalledWith(
      recallId,
      { category: 'RECALL_NOTIFICATION', fileName: 'IN CUSTODY RECALL SMITH JOHN 4567.pdf' },
      userToken
    )
    expect(res.locals.documentId).toBe(documentId)
  })

  it('uses the latest existing document if it exists', async () => {
    req.query.category = 'RECALL_NOTIFICATION'
    const latestExistingDocId = '456'
    ;(getDocumentCategoryHistory as jest.Mock).mockResolvedValue([
      {
        documentId: '2740e4ba-ed67-43ad-8c5c-c0ac927994dc',
        category: 'RECALL_NOTIFICATION',
        fileName: 'RECALL_NOTIFICATION.pdf',
        version: 1,
        createdDateTime: '2022-01-18T15:01:48.326809Z',
        createdByUserName: 'Jonathan Wyatt',
      },
      {
        documentId: latestExistingDocId,
        category: 'RECALL_NOTIFICATION',
        fileName: 'RECALL_NOTIFICATION.pdf',
        version: 2,
        details: 'dsafdsf',
        createdDateTime: '2022-01-18T15:23:36.900691Z',
        createdByUserName: 'Jonathan Wyatt',
      },
    ])
    expect(generateRecallDocument).not.toHaveBeenCalled()
    await createGeneratedDocument(req, res, next)
    expect(res.locals.documentId).toBe(latestExistingDocId)
  })

  it('returns 400 for an invalid category', async () => {
    req.query.category = 'LICENCE'
    await createGeneratedDocument(req, res, next)
    expect(res.sendStatus).toHaveBeenCalledWith(400)
  })
})
