// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getRecallNotification } from './manageRecallsApiClient'
import * as configModule from '../../config'
import getRecallNotificationResponseJson from '../../../fake-manage-recalls-api/stubs/__files/get-recall-notification.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

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
        ...pactGetRequest('a get revocation order request', `/recalls/${recallId}/revocationOrder`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getRecallNotificationResponseJson), 200),
      })

      const actual = await getRecallNotification(recallId, accessToken)

      expect(actual).toEqual(getRecallNotificationResponseJson)
    })
  })

  test('returns 401 if invalid user', async () => {
    await provider.addInteraction({
      state: 'an unauthorized user accessToken',
      ...pactGetRequest(
        'an unauthorized get revocation order request',
        `/recalls/${recallId}/revocationOrder`,
        accessToken
      ),
      willRespondWith: { status: 401 },
    })

    try {
      await getRecallNotification(recallId, accessToken)
    } catch (exception) {
      expect(exception.status).toEqual(401)
    }
  })
})
