// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getCurrentUserDetails, getUserDetails } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getUserResponseJson from '../fake-manage-recalls-api/stubs/__files/user.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const userId = '11111111-1111-1111-1111-111111111111'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get user details', () => {
    test('can successfully get a users details by userId', async () => {
      await provider.addInteraction({
        state: 'a user exists',
        ...pactGetRequest('a get user details request', `/users/${userId}`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getUserResponseJson), 200),
      })

      const actual = await getUserDetails(userId, accessToken)

      expect(actual).toEqual(getUserResponseJson)
    })

    test('can successfully get current users details', async () => {
      await provider.addInteraction({
        state: 'a user exists',
        ...pactGetRequest('a get current user details request', `/users/current`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getUserResponseJson), 200),
      })

      const actual = await getCurrentUserDetails(accessToken)

      expect(actual).toEqual(getUserResponseJson)
    })

    test('returns 404 if invalid user', async () => {
      const invalidUserId = '00000000-1111-0000-1111-000000000000'
      await provider.addInteraction({
        state: 'no state required',
        ...pactGetRequest('get users for missing user ID', `/users/${invalidUserId}`, accessToken),
        willRespondWith: { status: 404 },
      })

      try {
        await getUserDetails(invalidUserId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(404)
      }
    })
  })
})
