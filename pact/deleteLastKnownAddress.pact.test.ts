// @ts-nocheck
import { pactWith } from 'jest-pact'
import { deleteLastKnownAddress } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import { pactDeleteRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const lastKnownAddressId = '345'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const url = `/recalls/${recallId}/last-known-addresses/${lastKnownAddressId}`

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('delete document from recall', () => {
    test('can delete a last known address', async () => {
      await provider.addInteraction({
        state: 'a recall with last known addresses exists',
        ...pactDeleteRequest('a delete last known address request', url, accessToken),
        willRespondWith: { status: 204 },
      })

      const actual = await deleteLastKnownAddress(recallId, lastKnownAddressId, accessToken)

      expect(actual.status).toEqual(204)
    })

    test('returns 401 if invalid token', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactDeleteRequest('an unauthorized user accessToken', url, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await deleteLastKnownAddress(recallId, lastKnownAddressId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
