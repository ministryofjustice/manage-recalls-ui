import { SessionData } from 'express-session'
import { getStoredSessionData } from './getStoredSessionData'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../controllers/testUtils/mockRequestUtils'

describe('store flash errors on request session (middleware)', () => {
  it("doesn't set res.locals.errors if no errors on the request session", () => {
    const req = mockGetRequest({})
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(res.locals.errors).toBeUndefined()
  })

  it('sets res.locals.errors if there are errors on the request session', () => {
    const errors = [
      { name: 'field', href: '#field', text: 'Boom' },
      { name: 'field2', href: '#field2', text: 'Boom2' },
    ]
    const req = mockGetRequest({ session: { errors } as SessionData })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(req.session).toEqual({})
    expect(res.locals.errors).toEqual({
      field: { href: '#field', text: 'Boom' },
      field2: { href: '#field2', text: 'Boom2' },
      list: [
        { href: '#field', name: 'field', text: 'Boom' },
        {
          href: '#field2',
          name: 'field2',
          text: 'Boom2',
        },
      ],
    })
  })

  it('sets a confirmation message if supplied', () => {
    const confirmationMessage = {
      text: 'Document was deleted',
      type: 'success',
    }
    const req = mockGetRequest({ session: { confirmationMessage } as SessionData })
    const { res } = mockResponseWithAuthenticatedUser('user_access_token')
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(req.session).toEqual({})
    expect(res.locals.confirmationMessage).toEqual({
      text: 'Document was deleted',
      type: 'success',
    })
  })
})
