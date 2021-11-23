// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getCourts } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getCourtsJson from '../fake-manage-recalls-api/stubs/__files/get-courts.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get courts', () => {
    test('can successfully retrieve a list of courts', async () => {
      await provider.addInteraction({
        state: 'no state required',
        ...pactGetRequest('a get courts request', '/reference-data/courts'),
        willRespondWith: pactJsonResponse(Matchers.like(getCourtsJson), 200),
      })
      const actual = await getCourts()
      expect(actual).toEqual(getCourtsJson)
    })
  })
})
