// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getFieldHistory } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getFieldHistoryResponseJson from '../fake-manage-recalls-api/stubs/__files/get-field-history.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const token = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const fieldId = 'currentPrison'
  const path = `/audit/${recallId}/${fieldId}`

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get uploaded recall field history', () => {
    test("can successfully retrieve a field's history", async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactGetRequest('a get recall field history request', path, token),
        willRespondWith: pactJsonResponse(Matchers.like(getFieldHistoryResponseJson), 200),
      })

      const actual = await getFieldHistory(recallId, fieldId, token)
      expect(actual).toEqual(getFieldHistoryResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactGetRequest('an unauthorized get recall field history request', path, token),
        willRespondWith: { status: 401 },
      })

      try {
        await getFieldHistory(recallId, fieldId, token)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
