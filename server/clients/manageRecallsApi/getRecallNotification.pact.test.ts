// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getGeneratedDocument } from './manageRecallsApiClient'
import * as configModule from '../../config'
import getRecallNotificationResponseJson from '../../../fake-manage-recalls-api/stubs/__files/get-recall-notification.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get recall notification document', () => {
    test('can successfully get a recall notification', async () => {
      await provider.addInteraction({
        state: 'a recall notification can be downloaded',
        ...pactGetRequest('a get recall notification request', `/recalls/${recallId}/recallNotification`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getRecallNotificationResponseJson), 200),
      })

      const actual = await getGeneratedDocument('recallNotification')(recallId, accessToken)

      expect(actual).toEqual(getRecallNotificationResponseJson)
    })
  })

  test('returns 401 if invalid user', async () => {
    await provider.addInteraction({
      state: 'an unauthorized user accessToken',
      ...pactGetRequest(
        'an unauthorized get recall notification request',
        `/recalls/${recallId}/recallNotification`,
        accessToken
      ),
      willRespondWith: { status: 401 },
    })

    try {
      await getGeneratedDocument('recallNotification')(recallId, accessToken)
    } catch (exception) {
      expect(exception.status).toEqual(401)
    }
  })
})
