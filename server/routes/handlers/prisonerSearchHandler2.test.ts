import { getMockReq, getMockRes } from '@jest-mock/express'
import nock from 'nock'
import config from '../../config'
import prisonerSearchHandler from './prisonerSearchHandler'

const userToken = { access_token: 'token-1', expires_in: 300 }
const nomsNumber = 'AA123AA'

describe('prisonerSearchHandler', () => {
  let fakeManageRecallsApi: nock.Scope

  beforeEach(() => {
    fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('searchPrisoners', () => {
    it('should return data from api for a valid noms number', async () => {
      const expectedPrisoners = [
        {
          firstName: 'Bertie',
          lastName: 'Badger',
          nomsNumber,
          dateOfBirth: '1990-10-30',
        },
      ]

      fakeManageRecallsApi
        .post('/search')
        .matchHeader('authorization', `Bearer ${userToken.access_token}`)
        .reply(200, expectedPrisoners)

      const req = mockRequestWithNomsNumber()
      const { res, next } = mockResponseWithAuthenticatedUser()

      await prisonerSearchHandler()(req, res, next)

      expect(res.locals.prisoners).toEqual(expectedPrisoners)
      expect(res.render).toHaveBeenCalledWith('pages/index')
    })

    it('should return 400 if invalid noms number', async () => {
      const req = getMockReq({
        body: {},
      })
      const { res, next } = getMockRes()

      await prisonerSearchHandler()(req, res, next)

      expect(res.send).toHaveBeenCalledWith(400)
    })
  })
})

function mockRequestWithNomsNumber() {
  return getMockReq({
    body: { nomsNumber },
  })
}

function mockResponseWithAuthenticatedUser() {
  return getMockRes({
    locals: {
      user: {
        token: userToken.access_token,
      },
    },
  })
}
