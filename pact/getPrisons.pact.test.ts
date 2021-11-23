// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getPrisons } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getPrisonsJson from '../fake-manage-recalls-api/stubs/__files/get-prisons.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get prisons', () => {
    test('can successfully retrieve a list of prisons', async () => {
      await provider.addInteraction({
        state: 'no state required',
        ...pactGetRequest('a get prisons request', '/reference-data/prisons'),
        willRespondWith: pactJsonResponse(Matchers.like(getPrisonsJson), 200),
      })
      const actual = await getPrisons()
      expect(actual).toEqual(getPrisonsJson)
    })
  })
})
