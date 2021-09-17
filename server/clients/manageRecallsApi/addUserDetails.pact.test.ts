// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { addUserDetails } from './manageRecallsApiClient'
import * as configModule from '../../config'
import addUserResponseJson from '../../../fake-manage-recalls-api/stubs/__files/add-user.json'
import { pactJsonResponse, pactPostRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const userId = '00000000-0000-0000-0000-000000000000'
  const firstName = 'Jimmy'
  const lastName = 'Ppud'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('add user details', () => {
    test('can successfully add a users details', async () => {
      await provider.addInteraction({
        state: 'a user can store their details',
        ...pactPostRequest('an add user details request', '/users', { userId, firstName, lastName }, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(addUserResponseJson), 201),
      })

      const actual = await addUserDetails(userId, firstName, lastName, accessToken)

      expect(actual).toEqual(addUserResponseJson)
    })

    test('returns 400 if blank userId provided', async () => {
      const blankUserId = ''
      const errorResponse = {
        status: 'BAD_REQUEST',
      }
      await provider.addInteraction({
        state: 'a user can store their details',
        ...pactPostRequest(
          'an add user details request with blank userId',
          '/users',
          { userId: blankUserId, firstName, lastName },
          accessToken
        ),
        willRespondWith: pactJsonResponse(Matchers.like(errorResponse), 400),
      })

      try {
        await addUserDetails(blankUserId, firstName, lastName, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(400)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPostRequest(
          'an unauthorized create recall request',
          '/users',
          { userId, firstName, lastName },
          accessToken
        ),
        willRespondWith: { status: 401 },
      })

      try {
        await addUserDetails(userId, firstName, lastName, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
