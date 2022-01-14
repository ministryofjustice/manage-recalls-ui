// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getAllFieldsHistory } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getFieldsHistoryResponseJson from '../fake-manage-recalls-api/stubs/__files/get-all-fields-history.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const token = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const path = `/audit/${recallId}`

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get uploaded recall field history', () => {
    test("can successfully retrieve a field's history", async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactGetRequest('a get recall field history request', path, token),
        willRespondWith: pactJsonResponse(Matchers.like(getFieldsHistoryResponseJson), 200),
      })

      const actual = await getAllFieldsHistory(recallId, token)
      expect(actual).toEqual(getFieldsHistoryResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactGetRequest('an unauthorized get recall field history request', path, token),
        willRespondWith: { status: 401 },
      })

      try {
        await getAllFieldsHistory(recallId, token)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
