// @ts-nocheck
import { checkUserDetailsExist } from './checkUserDetailsExist'
import { getCurrentUserDetails } from '../clients/manageRecallsApiClient'

jest.mock('../clients/manageRecallsApiClient')

describe('checkUserDetailsExist', () => {
  let req
  const token = '123'
  const res = {
    locals: {},
  }
  let next
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
    req = {
      url: '/',
    }
    res.locals.user = {
      token,
    }
    res.redirect = jest.fn()
    next = jest.fn()
  })

  it('calls manage recalls APIs, then calls next middleware, if user present on res.locals', async () => {
    ;(getCurrentUserDetails as jest.Mock).mockResolvedValue(userDetails)
    await checkUserDetailsExist(req, res, next)
    expect(getCurrentUserDetails).toHaveBeenCalledWith(token)
    expect(next).toHaveBeenCalled()
  })

  it('redirects to user details page if the user details are not present', async () => {
    ;(getCurrentUserDetails as jest.Mock).mockRejectedValue({ status: 404 })
    await checkUserDetailsExist(req, res, next)
    expect(res.redirect).toHaveBeenCalledWith('/user-details')
  })

  it('calls next if the user details call errors with a code other than 404', async () => {
    ;(getCurrentUserDetails as jest.Mock).mockRejectedValue({ status: 401 })
    await checkUserDetailsExist(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
