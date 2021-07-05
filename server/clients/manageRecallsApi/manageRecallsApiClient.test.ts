import nock from 'nock'

import config from '../../config'
import { searchByNomsNumber, generateRevocationOrder, createRecall } from './manageRecallsApiClient'

const token = { access_token: 'token-1', expires_in: 300 }
const nomsNumber = 'NOMS_NUMBER'

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
          nomsNumber: '13AAA',
          dateOfBirth: '1990-10-30',
        },
      ]

      fakeManageRecallsApi
        .post('/search')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, expectedResponse)

      const actual = await searchByNomsNumber(nomsNumber, token.access_token)

      expect(actual).toEqual(expectedResponse[0])
    })
  })

  describe('generateRevocationOrder', () => {
    it('should generate revocation order', async () => {
      const base64EncodedContents = Buffer.from('some contents').toString('base64')
      const expectedResponse = { contents: base64EncodedContents }

      fakeManageRecallsApi
        .post('/generate-revocation-order')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, expectedResponse)

      const actual = await generateRevocationOrder(nomsNumber, token.access_token)

      expect(actual).toEqual(expectedResponse)
    })
  })

  describe('createRecallOrder', () => {
    it('should create recall', async () => {
      const expectedResponse = { contents: 1234 }

      fakeManageRecallsApi
        .post('/recalls')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, expectedResponse)

      const actual = await createRecall('NOMS_NUMBER', token.access_token)

      expect(actual).toEqual(expectedResponse)
    })
  })
})
