// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getPoliceForces } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getPoliceForcesJson from '../fake-manage-recalls-api/stubs/__files/get-police-forces.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get police forces', () => {
    test('can successfully retrieve a list of policeForces', async () => {
      await provider.addInteraction({
        state: 'no state required',
        ...pactGetRequest('a get policeForces request', '/reference-data/police-forces'),
        willRespondWith: pactJsonResponse(Matchers.like(getPoliceForcesJson), 200),
      })
      const actual = await getPoliceForces()
      expect(actual).toEqual(getPoliceForcesJson)
    })
  })
})
