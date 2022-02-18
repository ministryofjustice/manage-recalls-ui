// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getPrisons } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import getStopReasonsJson from '../fake-manage-recalls-api/stubs/__files/get-stop-reasons.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get stop recall reasons', () => {
    test('can successfully retrieve a list of stop recall reasons', async () => {
      await provider.addInteraction({
        state: 'no state required',
        ...pactGetRequest('a get prisons request', '/reference-data/stop-reasons'),
        willRespondWith: pactJsonResponse(Matchers.like(getStopReasonsJson), 200),
      })
      const actual = await getPrisons()
      expect(actual).toEqual(getStopReasonsJson)
    })
  })
})
