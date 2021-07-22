// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getRevocationOrder } from './manageRecallsApiClient'
import * as configModule from '../../config'
import getRevocationOrderResponseJson from '../../../fake-manage-recalls-api/stubs/__files/get-revocation-order.json'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get revocation order', () => {
    test('can successfully get a revocation order', async () => {
      await provider.addInteraction({
        state: 'a revocation order can be downloaded',
        ...getRevocationOrderRequest('a get revocation order request', recallId, accessToken),
        willRespondWith: getRevocationOrderResponse(Matchers.like(getRevocationOrderResponseJson), 200),
      })

      const actual = await getRevocationOrder(recallId, accessToken)

      expect(actual).toEqual(getRevocationOrderResponseJson)
    })
  })

  test('returns 401 if invalid user', async () => {
    await provider.addInteraction({
      state: 'an unauthorized user accessToken',
      ...getRevocationOrderRequest('an unauthorized get revocation order request', recallId, accessToken),
      willRespondWith: { status: 401 },
    })

    try {
      await getRevocationOrder(recallId, accessToken)
    } catch (exception) {
      expect(exception.status).toEqual(401)
    }
  })
})

function getRevocationOrderRequest(description: string, recallId: string, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'GET',
      path: `/recalls/${recallId}/revocationOrder`,
      headers: { Authorization: `Bearer ${token}` },
    },
  }
}

function getRevocationOrderResponse(responseBody, expectedStatus = 200) {
  return {
    status: expectedStatus,
    headers: { 'Content-Type': 'application/json' },
    body: responseBody,
  }
}
