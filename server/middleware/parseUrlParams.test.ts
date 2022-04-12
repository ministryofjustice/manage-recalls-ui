import { NextFunction, Response } from 'express'
import { parseUrlParams } from './parseUrlParams'
import { mockReq, mockRes } from '../controllers/testUtils/mockRequestUtils'

describe('parseUrlParams', () => {
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    res = mockRes()
    next = jest.fn()
  })

  it('parses nomsNumber and recall ID from URL', () => {
    const req = mockReq({ params: { recallId: '123-456', pageSlug: 'last-release' } })
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo).toEqual({ basePath: '/recalls/123-456/', currentPage: 'last-release' })
  })

  it('returns 400 if nomsNumber is invalid', () => {
    const req = mockReq({ params: { recallId: '123-456' } })
    parseUrlParams(req, res, next)
    expect(res.sendStatus).toHaveBeenCalledWith(400)
  })

  it('returns 400 if pageSlug is missing', () => {
    const req = mockReq({ params: { recallId: '123-456' } })
    parseUrlParams(req, res, next)
    expect(res.sendStatus).toHaveBeenCalledWith(400)
  })

  it('parses fromPage from URL for check answers page', () => {
    const req = mockReq({
      params: { recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: 'check-answers' },
    })
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromPage).toEqual('check-answers')
  })

  it('parses fromPage from URL for assess page', () => {
    const req = mockReq({
      params: { recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: 'assess' },
    })
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromPage).toEqual('assess')
  })

  it('parses fromPage from URL for dossier recall page', () => {
    const req = mockReq({
      params: { recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: 'dossier-recall' },
    })
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromPage).toEqual('dossier-recall')
  })

  it('parses fromPage from URL for view recall page', () => {
    const req = mockReq({
      params: { recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: 'view-recall' },
    })
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromPage).toEqual('view-recall')
  })

  it('parses fromPage from URL when it starts with /', () => {
    const req = mockReq({
      params: { recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: '/' },
    })
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromPage).toEqual('/')
    expect(res.locals.urlInfo.basePath).toEqual('')
  })

  it('parses fromHash from URL', () => {
    const req = mockReq({
      params: { recallId: '123-456', pageSlug: 'last-release' },
      query: { fromHash: 'sentence' },
    })
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromHash).toEqual('sentence')
  })

  it('reloads the page without the query string if the fromPage param is invalid', () => {
    const req = mockReq({
      params: { recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: 'invalid-page' },
      baseUrl: '/recalls/456/start',
    })
    parseUrlParams(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith(req.baseUrl)
  })
})
