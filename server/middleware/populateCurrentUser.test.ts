// @ts-nocheck
import { populateCurrentUser } from './populateCurrentUser'
import { getCurrentUserDetails } from '../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApi/manageRecallsApiClient')

describe('populateCurrentUser', () => {
  let req
  const token = '123'
  const res = {
    locals: {},
  }
  let next
  let userService
  const userDetails = {
    firstName: 'Barry',
    lastName: 'Badger',
    email: 'barry@badger.com',
    phoneNumber: '0739378378',
    caseworkerBand: 'FOUR_PLUS',
    signature: 'def',
    userId: '123',
  }

  beforeEach(() => {
    req = {}
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

  it('calls userService and manage recalls APIs, then calls next middleware, if user present on res.locals', async () => {
    ;(getCurrentUserDetails as jest.Mock).mockResolvedValue(userDetails)
    await populateCurrentUser(userService)(req, res, next)
    expect(userService.getUser).toHaveBeenCalledWith(token)
    expect(getCurrentUserDetails).toHaveBeenCalledWith(token)
    expect(next).toHaveBeenCalled()
  })

  it("doesn't redirect to user details page if the user details are not present and the request is already for user details page", async () => {
    ;(getCurrentUserDetails as jest.Mock).mockRejectedValue({ status: 404 })
    req.url = '/user-details'
    await populateCurrentUser(userService)(req, res, next)
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('redirects to user details page if the user details are not present and the request is not for user details page', async () => {
    ;(getCurrentUserDetails as jest.Mock).mockRejectedValue({ status: 404 })
    req.url = '/'
    await populateCurrentUser(userService)(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/user-details')
  })

  it('adds the API responses to res.locals.user', async () => {
    ;(getCurrentUserDetails as jest.Mock).mockResolvedValue(userDetails)
    userService.getUser.mockResolvedValue({ name: 'Dave' })
    await populateCurrentUser(userService)(req, res, next)
    expect(res.locals.user).toEqual({
      ...userDetails,
      name: 'Dave',
      token,
    })
  })
})
