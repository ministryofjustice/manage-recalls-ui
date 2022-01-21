// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getLocalDeliveryUnits } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import getLocalDeliveryUnitsJson from '../fake-manage-recalls-api/stubs/__files/get-local-delivery-units.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get local delivery units', () => {
    test('can successfully retrieve a list of local delivery units', async () => {
      await provider.addInteraction({
        state: 'no state required',
        ...pactGetRequest('a get local delivery units request', '/reference-data/local-delivery-units'),
        willRespondWith: pactJsonResponse(Matchers.like(getLocalDeliveryUnitsJson), 200),
      })
      const actual = await getLocalDeliveryUnits()
      expect(actual).toEqual(getLocalDeliveryUnitsJson)
    })
  })
})
