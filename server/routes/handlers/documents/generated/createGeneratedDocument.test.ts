import { NextFunction, Request, Response } from 'express'
import { createGeneratedDocument } from './createGeneratedDocument'
import { generateRecallDocument } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../../../clients/manageRecallsApi/manageRecallsApiClient')

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

  it('sets the created document ID on res.locals', async () => {
    req.query.category = 'DOSSIER'
    ;(generateRecallDocument as jest.Mock).mockResolvedValue({ documentId })
    await createGeneratedDocument(req, res, next)
    expect(res.locals.documentId).toBe(documentId)
  })

  it('returns 400 for an invalid category', async () => {
    req.query.category = 'LICENCE'
    ;(generateRecallDocument as jest.Mock).mockResolvedValue({ documentId })
    await createGeneratedDocument(req, res, next)
    expect(res.sendStatus).toHaveBeenCalledWith(400)
  })
})
