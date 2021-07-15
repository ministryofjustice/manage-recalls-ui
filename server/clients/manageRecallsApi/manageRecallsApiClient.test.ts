import nock from 'nock'

import config from '../../config'
import { generateRevocationOrder } from './manageRecallsApiClient'

const token = { access_token: 'token-1', expires_in: 300 }
const nomsNumber = 'NOMS_NUMBER'

// TODO:  Delete this test once all endpoints have a pact test
describe('manageRecallsApi', () => {
  let fakeManageRecallsApi: nock.Scope

  beforeEach(() => {
    fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
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
})
