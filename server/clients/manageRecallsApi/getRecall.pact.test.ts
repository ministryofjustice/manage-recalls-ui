// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getRecall } from './manageRecallsApiClient'
import * as configModule from '../../config'
import getRecallResponseJson from '../../../fake-manage-recalls-api/stubs/__files/get-recall.json'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get recall', () => {
    test('can successfully retrieve a recall', async () => {
      await provider.addInteraction({
        state: 'a recall exists',
        ...getRecallRequest('a get recall request', recallId, accessToken),
        willRespondWith: getRecallResponse(Matchers.like(getRecallResponseJson), 200),
      })

      const actual = await getRecall(recallId, accessToken)

      expect(actual).toEqual(getRecallResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...getRecallRequest('an unauthorized get recall request', recallId, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await getRecall(recallId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})

function getRecallRequest(description: string, recallId: string, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'GET',
      path: `/recalls/${recallId}`,
      headers: { Authorization: `Bearer ${token}` },
    },
  }
}

function getRecallResponse(responseBody, expectedStatus = 200) {
  return {
    status: expectedStatus,
    headers: { 'Content-Type': 'application/json' },
    body: responseBody,
  }
}
