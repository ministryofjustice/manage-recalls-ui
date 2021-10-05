import { parseUrlParams } from './parseUrlParams'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../routes/testutils/mockRequestUtils'

describe('parseUrlParams', () => {
  it('parses nomsNumber and recall ID from URL', () => {
    const req = mockGetRequest({ params: { nomsNumber: 'A1234BC', recallId: '123-456' } })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo).toEqual({ basePath: '/persons/A1234BC/recalls/123-456/' })
  })

  it('returns 400 if nomsNumber is invalid', () => {
    const req = mockGetRequest({ params: { nomsNumber: 'ABC1234BC', recallId: '123-456' } })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.sendStatus).toHaveBeenCalledWith(400)
  })

  it('parses fromPage from URL', () => {
    const req = mockGetRequest({
      params: { nomsNumber: 'A1234BC', recallId: '123-456' },
      query: { fromPage: 'check-answers' },
    })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.locals.urlInfo.fromPage).toEqual('check-answers')
  })

  it('reloads the page without the query string if the fromPage param is invalid', () => {
    const req = mockGetRequest({
      params: { nomsNumber: 'A1234BC', recallId: '123-456' },
      query: { fromPage: 'invalid-page' },
      path: '/person/123/recalls/456/start',
    })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    parseUrlParams(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith(req.path)
  })
})
