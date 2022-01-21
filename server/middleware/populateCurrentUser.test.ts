// @ts-nocheck
import populateCurrentUser from './populateCurrentUser'

jest.mock('../clients/manageRecallsApiClient')

describe('populateCurrentUser', () => {
  let req
  const token = '123'
  const res = {
    locals: {},
  }
  let next
  let userService

  beforeEach(() => {
    req = {
      url: '/',
    }
    res.locals.user = {
      token,
    }
    res.redirect = jest.fn()
    next = jest.fn()
    userService = {
      getUser: jest.fn(),
    }
  })

  afterEach(() => jest.resetAllMocks())

  it('makes no API calls, then calls next middleware, if no user on res.locals', async () => {
    res.locals = {}
    await populateCurrentUser(userService)(req, res, next)
    expect(userService.getUser).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('calls userService, then calls next middleware, if user present on res.locals', async () => {
    await populateCurrentUser(userService)(req, res, next)
    expect(userService.getUser).toHaveBeenCalledWith(token)
    expect(next).toHaveBeenCalled()
  })

  it('adds the API responses to res.locals.user', async () => {
    userService.getUser.mockResolvedValue({ name: 'Dave' })
    await populateCurrentUser(userService)(req, res, next)
    expect(res.locals.user).toEqual({
      name: 'Dave',
      token,
    })
  })
})
