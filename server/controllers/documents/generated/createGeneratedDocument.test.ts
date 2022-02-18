import { NextFunction, Request, Response } from 'express'
import { createGeneratedDocument } from './createGeneratedDocument'
import { generateRecallDocument, getDocumentCategoryHistory } from '../../../clients/manageRecallsApiClient'

jest.mock('../../../clients/manageRecallsApiClient')

const nomsNumber = 'AA123AA'
const recallId = '123'
const documentId = '123'

describe('createGeneratedDocument', () => {
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = { params: { nomsNumber, recallId, documentId }, query: {} } as unknown as Request
    res = {
      locals: { user: { token: '000' } },
      contentType: jest.fn(),
      header: jest.fn(),
      send: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response
    next = jest.fn()
  })

  afterEach(() => jest.resetAllMocks())

  it("creates a new document if one doesn't already exist", async () => {
    req.query.category = 'DOSSIER'
    ;(getDocumentCategoryHistory as jest.Mock).mockResolvedValue([])
    ;(generateRecallDocument as jest.Mock).mockResolvedValue({ documentId })
    await createGeneratedDocument(req, res, next)
    expect(generateRecallDocument).toHaveBeenCalled()
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
