import nock from 'nock'

import config from '../../config'
import { getRevocationOrder, getRecall } from './manageRecallsApiClient'

const token = { access_token: 'token-1', expires_in: 300 }
const recallId = 'RECALL_ID'

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

  describe('getRevocationOrder', () => {
    it('should get revocation order', async () => {
      const base64EncodedContents = Buffer.from('some contents').toString('base64')
      const expectedResponse = { contents: base64EncodedContents }

      fakeManageRecallsApi
        .get(`/recalls/${recallId}/revocationOrder`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, expectedResponse)

      const actual = await getRevocationOrder(recallId, token.access_token)

      expect(actual).toEqual(expectedResponse)
    })
  })

  describe('get recall', () => {
    it('should get recall', async () => {
      const expectedResponse = { contents: 1234 }

      fakeManageRecallsApi
        .get(`/recalls/${recallId}`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, expectedResponse)

      const actual = await getRecall(recallId, token.access_token)

      expect(actual).toEqual(expectedResponse)
    })
  })
})
