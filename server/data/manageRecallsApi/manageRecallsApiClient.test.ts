import nock from 'nock'

import config from '../../config'
import searchByNomisNumber from './manageRecallsApiClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('manageRecallsApi', () => {
  let fakeManageRecallsApi: nock.Scope

  beforeEach(() => {
    fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('searchPrisoners', () => {
    it('should return data from api', async () => {
      const expectedResponse = [
        {
          firstName: 'Bertie',
          lastName: 'Badger',
          nomisNumber: '13AAA',
          dateOfBirth: '1990-10-30',
        },
      ]

      fakeManageRecallsApi
        .post('/search')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, expectedResponse)

      const actual = await searchByNomisNumber('NOMS_NUMBER', token.access_token)

      expect(actual).toEqual(expectedResponse)
    })
  })
})
