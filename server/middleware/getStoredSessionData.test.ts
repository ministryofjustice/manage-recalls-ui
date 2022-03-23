// @ts-nocheck
import { getStoredSessionData } from './getStoredSessionData'
import { mockReq, mockRes } from '../controllers/testUtils/mockRequestUtils'

describe('store flash errors on request session (middleware)', () => {
  it("doesn't set res.locals.errors if no errors on the request session", () => {
    const req = mockReq({})
    const res = mockRes()
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(res.locals.errors).toBeUndefined()
  })

  it('sets res.locals.errors if there are errors on the request session', () => {
    const errors = [
      { name: 'field', href: '#field', text: 'Boom' },
      { name: 'field2', href: '#field2', text: 'Boom2' },
    ]
    const req = mockReq({ session: { errors } })
    const res = mockRes()
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
    const req = mockReq({ session: { confirmationMessage } })
    const res = mockRes()
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(req.session).toEqual({})
    expect(res.locals.confirmationMessage).toEqual({
      text: 'Document was deleted',
      type: 'success',
    })
  })

  it('deletes confirmation message if the requested page slug matches pageToDisplayOn', () => {
    const confirmationMessage = {
      text: 'Document was deleted',
      type: 'success',
      pageToDisplayOn: 'view-recall',
    }
    const req = mockReq({ session: { confirmationMessage }, params: { pageSlug: 'view-recall' } })
    const res = mockRes()
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(req.session).toEqual({})
  })

  it('does not delete confirmation message if the requested page slug does not match pageToDisplayOn', () => {
    const confirmationMessage = {
      text: 'Document was deleted',
      type: 'success',
      pageToDisplayOn: 'view-recall',
    }
    const req = mockReq({ session: { confirmationMessage }, params: { pageSlug: 'support-rerelease' } })
    const res = mockRes()
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(req.session).toEqual({
      confirmationMessage,
    })
  })

  it('deletes confirmation message if the request path matches pageToDisplayOn', () => {
    const confirmationMessage = {
      text: 'Document was deleted',
      type: 'success',
      pageToDisplayOn: '/',
    }
    const req = mockReq({ session: { confirmationMessage }, path: '/' })
    const res = mockRes()
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(req.session).toEqual({})
  })

  it('matches find-person page', () => {
    const confirmationMessage = {
      text: 'Document was deleted',
      type: 'success',
      pageToDisplayOn: '/find-person',
    }
    const req = mockReq({ session: { confirmationMessage }, path: '/find-person' })
    const res = mockRes()
    const next = jest.fn()
    getStoredSessionData(req, res, next)
    expect(req.session).toEqual({})
  })
})
