import { NextFunction, Request, Response } from 'express'
import { getDocumentChangeHistory } from './getDocumentChangeHistory'
import { getDocumentCategoryHistory } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('getDocumentChangeHistory', () => {
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = {
      params: {},
      query: {},
    } as Request
    res = {
      locals: {
        user: { token: 'token' },
      },
    } as unknown as Response
    next = jest.fn()
  })

  afterEach(() => jest.resetAllMocks())

  it('returns 400 if recallId missing', () => {
    getDocumentChangeHistory(req, res, next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid recallId'))
  })

  it('returns 400 if nomsNumber missing', () => {
    req.params.recallId = '456'
    getDocumentChangeHistory(req, res, next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid nomsNumber'))
  })

  it('returns 400 if category missing', () => {
    req.params.recallId = '456'
    req.params.nomsNumber = '123'
    getDocumentChangeHistory(req, res, next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid category'))
  })

  it('returns 400 if category invalid', () => {
    req.params.recallId = '456'
    req.params.nomsNumber = '123'
    req.query.category = 'REPORT'
    getDocumentChangeHistory(req, res, next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid category'))
  })

  it('sets documentHistory on res.locals', async () => {
    req.params.nomsNumber = '123'
    req.params.recallId = '456'
    req.query.category = 'LICENCE'
    ;(getDocumentCategoryHistory as jest.Mock).mockResolvedValue([
      {
        category: 'LICENCE',
        createdByUserName: 'Dave Smith',
        createdDateTime: '2021-12-09T13:40:50.483058Z',
        documentId: 'd4539cd4-c410-408a-b0c3-f91ba97b6e84',
        fileName: 'Licence Wesley Holt.pdf',
        version: 1,
      },
      {
        category: 'LICENCE',
        createdByUserName: 'Dave Smith',
        createdDateTime: '2021-11-24T10:40:50.483058Z',
        documentId: '123',
        fileName: 'Licence Wesley Holt version 2.pdf',
        version: 2,
      },
    ])
    await getDocumentChangeHistory(req, res, next)
    expect(res.locals.documentHistory).toEqual({
      category: 'LICENCE',
      label: 'Licence',
      standardFileName: 'Licence.pdf',
      items: [
        {
          category: 'LICENCE',
          createdByUserName: 'Dave Smith',
          createdDateTime: '2021-11-24T10:40:50.483058Z',
          documentId: '123',
          fileName: 'Licence Wesley Holt version 2.pdf',
          url: '/persons/123/recalls/456/documents/123',
          version: 2,
        },
        {
          category: 'LICENCE',
          createdByUserName: 'Dave Smith',
          createdDateTime: '2021-12-09T13:40:50.483058Z',
          documentId: 'd4539cd4-c410-408a-b0c3-f91ba97b6e84',
          fileName: 'Licence Wesley Holt.pdf',
          url: '/persons/123/recalls/456/documents/d4539cd4-c410-408a-b0c3-f91ba97b6e84',
          version: 1,
        },
      ],
    })
  })
})
