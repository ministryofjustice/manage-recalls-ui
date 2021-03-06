// @ts-nocheck
import { mockReq } from '../testUtils/mockRequestUtils'
import { getUser, postUser } from './userDetails'
import { uploadStorageField } from '../documents/upload/helpers/uploadStorage'
import { addUserDetails, getCurrentUserDetails } from '../../clients/manageRecallsApiClient'

jest.mock('../../clients/manageRecallsApiClient')
jest.mock('../documents/upload/helpers/uploadStorage')

const userToken = 'token-1'

describe('getUser', () => {
  const userDetails = {
    firstName: 'Barry',
    lastName: 'Badger',
    email: 'barry@badger.com',
    phoneNumber: '0739378378',
    caseworkerBand: 'FOUR_PLUS',
    signature: 'def',
    userId: '123',
  }

  it('renders the user if found', done => {
    ;(getCurrentUserDetails as jest.Mock).mockResolvedValue(userDetails)
    const req = mockReq({ originalUrl: '/user-details' })
    const res = {
      locals: {
        user: {
          token: userToken,
          displayName: 'Barry Badger',
        },
      },
      render: view => {
        expect(view).toEqual(`pages/userDetails`)
        expect(res.locals.user).toEqual({
          firstName: 'Barry',
          lastName: 'Badger',
          email: 'barry@badger.com',
          phoneNumber: '0739378378',
          caseworkerBand: 'FOUR_PLUS',
          signature: 'def',
          displayName: 'Barry Badger',
          token: userToken,
        })
        done()
      },
    }
    getUser(req, res)
  })

  it('calls error middleware if the API call fails', async () => {
    ;(getCurrentUserDetails as jest.Mock).mockRejectedValue({ status: 401 })
    const req = mockReq({ originalUrl: '/user-details' })
    const res = {
      locals: {
        user: {
          token: userToken,
          displayName: 'Barry Badger',
        },
      },
    }
    const next = jest.fn()
    await getUser(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})

describe('postUser', () => {
  const requestBody = {
    firstName: 'Barry',
    lastName: 'Badger',
    email: 'barry@badger.com',
    phoneNumber: '07393783789',
    caseworkerBand: 'THREE',
  }
  const signature = 'def'
  const userId = '123'

  it('saves submitted values', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'signature.jpg',
        buffer: signature,
        mimetype: 'image/jpeg',
      }
      cb()
    })
    ;(addUserDetails as jest.Mock).mockResolvedValue({
      userId,
    })
    const req = mockReq({ method: 'POST', body: requestBody, originalUrl: '/user-details' })
    const res = {
      locals: {
        user: {
          token: userToken,
        },
      },
      redirect: (httpStatus, path) => {
        expect(addUserDetails).toHaveBeenCalledWith({ ...requestBody, signature }, userToken)
        expect(req.session.errors).toBeUndefined()
        expect(req.session.unsavedValues).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/user-details')
        done()
      },
    }
    postUser(req, res)
  })

  it('errors if the signature is the wrong file type', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'signature.png',
        buffer: signature,
        mimetype: 'image/png',
      }
      cb()
    })
    const req = mockReq({ method: 'POST', body: requestBody, originalUrl: '/user-details' })
    const res = {
      locals: {
        user: {
          token: userToken,
        },
      },
      redirect: (httpStatus, path) => {
        expect(addUserDetails).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          { href: '#signature', name: 'signature', text: 'The selected signature image must be a JPG or JPEG' },
        ])
        expect(req.session.unsavedValues).toEqual(requestBody)
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/user-details')
        done()
      },
    }
    postUser(req, res)
  })

  it('creates error messages if inputs are empty but there is an existing signature', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      cb()
    })
    const req = mockReq({
      method: 'POST',
      body: { existingSignature: signature },
      originalUrl: '/user-details',
    })
    const res = {
      locals: {
        user: {
          token: userToken,
        },
      },
      redirect: (httpStatus, path) => {
        expect(addUserDetails).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#firstName',
            name: 'firstName',
            text: 'Enter a first name',
          },
          {
            href: '#lastName',
            name: 'lastName',
            text: 'Enter a last name',
          },
          {
            href: '#email',
            name: 'email',
            text: 'Enter an email address',
          },
          {
            href: '#phoneNumber',
            name: 'phoneNumber',
            text: 'Enter a phone number',
          },
          {
            href: '#caseworkerBand',
            name: 'caseworkerBand',
            text: 'Select a band',
          },
        ])
        expect(req.session.unsavedValues).toEqual({
          existingSignature: signature,
        })
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/user-details')
        done()
      },
    }
    postUser(req, res)
  })

  it('creates an error message if there is no signature uploaded and no existing signature', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      cb()
    })
    const req = mockReq({ method: 'POST', body: requestBody, originalUrl: '/user-details' })
    const res = {
      locals: {
        user: {
          token: userToken,
        },
      },
      redirect: (httpStatus, path) => {
        expect(addUserDetails).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#signature',
            name: 'signature',
            text: 'Upload a signature',
          },
        ])
        expect(req.session.unsavedValues).toEqual(requestBody)
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/user-details')
        done()
      },
    }
    postUser(req, res)
  })

  it('saves if no signature is uploaded but an existing signature is present', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      cb()
    })
    ;(addUserDetails as jest.Mock).mockResolvedValue({
      userId,
    })
    const req = mockReq({
      method: 'POST',
      body: { ...requestBody, existingSignature: signature },
      originalUrl: '/user-details',
    })
    const res = {
      locals: {
        user: {
          token: userToken,
        },
      },
      redirect: (httpStatus, path) => {
        expect(addUserDetails).toHaveBeenCalledWith({ ...requestBody, signature }, userToken)
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/user-details')
        done()
      },
    }
    postUser(req, res)
  })
})
