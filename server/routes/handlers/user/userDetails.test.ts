// @ts-nocheck
import { mockPostRequest } from '../../testutils/mockRequestUtils'
import { postUser } from './userDetails'
import { uploadStorageField } from '../helpers/uploadStorage'
import { addUserDetails } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../helpers/uploadStorage')

describe('postUser', () => {
  afterEach(() => jest.resetAllMocks())

  it('should save submitted values', done => {
    const userId = '123'
    const firstName = 'Barry'
    const lastName = 'Badger'
    const email = 'barry@badger.com'
    const phoneNumber = '0739378378'
    const userToken = 'token-1'
    const signatureEncoded = 'def'

    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'signature.jpg',
        buffer: signatureEncoded,
        mimetype: 'image/jpeg',
      }
      cb()
    })
    ;(addUserDetails as jest.Mock).mockResolvedValue({
      userId,
    })

    const req = mockPostRequest({ body: { firstName, lastName, email, phoneNumber } })
    const res = {
      locals: {
        user: {
          token: userToken,
          uuid: userId,
        },
      },
      redirect: (httpStatus, path) => {
        expect(addUserDetails).toHaveBeenCalledWith(
          userId,
          firstName,
          lastName,
          signatureEncoded,
          email,
          phoneNumber,
          userToken
        )
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/user-details')
        done()
      },
    }

    postUser(req, res)
  })

  it('errors if the signature is the wrong file type', done => {
    const userId = '123'
    const firstName = 'Barry'
    const lastName = 'Badger'
    const email = 'barry@badger.com'
    const phoneNumber = '0739378378'
    const userToken = 'token-1'

    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'signature.png',
        buffer: 'def',
        mimetype: 'image/png',
      }
      cb()
    })

    const req = mockPostRequest({ body: { firstName, lastName, email, phoneNumber } })
    const res = {
      locals: {
        user: {
          token: userToken,
          uuid: userId,
        },
      },
      redirect: (httpStatus, path) => {
        expect(addUserDetails).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          { href: '#signature', name: 'signature', text: 'The selected signature image must be a JPG or JPEG' },
        ])
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/user-details')
        done()
      },
    }

    postUser(req, res)
  })
})
