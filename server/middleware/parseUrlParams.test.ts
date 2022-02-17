import { parseUrlParams } from './parseUrlParams'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../controllers/testUtils/mockRequestUtils'

describe('parseUrlParams', () => {
  it('parses nomsNumber and recall ID from URL', () => {
    const req = mockGetRequest({ params: { nomsNumber: 'A1234BC', recallId: '123-456', pageSlug: 'last-release' } })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo).toEqual({ basePath: '/persons/A1234BC/recalls/123-456/', currentPage: 'last-release' })
  })

  it('returns 400 if nomsNumber is invalid', () => {
    const req = mockGetRequest({ params: { nomsNumber: 'ABC1234BC', recallId: '123-456' } })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.sendStatus).toHaveBeenCalledWith(400)
  })

  it('returns 400 if pageSlug is missing', () => {
    const req = mockGetRequest({ params: { nomsNumber: 'ABC1234BC', recallId: '123-456' } })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.sendStatus).toHaveBeenCalledWith(400)
  })

  it('parses fromPage from URL for check answers page', () => {
    const req = mockGetRequest({
      params: { nomsNumber: 'A1234BC', recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: 'check-answers' },
    })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromPage).toEqual('check-answers')
  })

  it('parses fromPage from URL for assess page', () => {
    const req = mockGetRequest({
      params: { nomsNumber: 'A1234BC', recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: 'assess' },
    })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromPage).toEqual('assess')
  })

  it('parses fromPage from URL for dossier recall page', () => {
    const req = mockGetRequest({
      params: { nomsNumber: 'A1234BC', recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: 'dossier-recall' },
    })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromPage).toEqual('dossier-recall')
  })

  it('parses fromPage from URL for view recall page', () => {
    const req = mockGetRequest({
      params: { nomsNumber: 'A1234BC', recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: 'view-recall' },
    })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromPage).toEqual('view-recall')
  })

  it('parses fromPage from URL when it starts with /', () => {
    const req = mockGetRequest({
      params: { nomsNumber: 'A1234BC', recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: '/' },
    })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromPage).toEqual('/')
    expect(res.locals.urlInfo.basePath).toEqual('')
  })

  it('parses fromHash from URL', () => {
    const req = mockGetRequest({
      params: { nomsNumber: 'A1234BC', recallId: '123-456', pageSlug: 'last-release' },
      query: { fromHash: 'sentence' },
    })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromHash).toEqual('sentence')
  })

  it('reloads the page without the query string if the fromPage param is invalid', () => {
    const req = mockGetRequest({
      params: { nomsNumber: 'A1234BC', recallId: '123-456', pageSlug: 'last-release' },
      query: { fromPage: 'invalid-page' },
      baseUrl: '/person/123/recalls/456/start',
    })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith(req.baseUrl)
  })
})
