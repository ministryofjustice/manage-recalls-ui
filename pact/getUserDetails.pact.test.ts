// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getCurrentUserDetails } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import getUserResponseJson from '../fake-manage-recalls-api/stubs/__files/user.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get user details', () => {
    test('can successfully get current users details', async () => {
      await provider.addInteraction({
        state: 'a user exists',
        ...pactGetRequest('a get current user details request', `/users/current`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getUserResponseJson), 200),
      })

      const actual = await getCurrentUserDetails(accessToken)

      expect(actual).toEqual(getUserResponseJson)
    })
  })
})
