// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { assignAssessingUser } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getRecallResponseJson from '../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { pactJsonResponse, pactPostRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const userId = '00000000-0000-0000-0000-000000000000'
  const recallId = '123-456'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('assign user to recall assessment', () => {
    test('can assign a user', async () => {
      await provider.addInteraction({
        state: 'a user can be assigned',
        ...pactPostRequest('an assign user request', `/recalls/${recallId}/assignee/${userId}`, {}, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getRecallResponseJson), 200),
      })

      const actual = await assignAssessingUser(recallId, userId, accessToken)

      expect(actual).toEqual(getRecallResponseJson)
    })

    test('returns 400 if blank userId provided', async () => {
      const blankUserId = ''
      const errorResponse = {
        status: 'BAD_REQUEST',
      }
      await provider.addInteraction({
        state: 'a missing user ID',
        ...pactPostRequest(
          'an assign user request with blank userId',
          `/recalls/${recallId}/assignee/${blankUserId}`,
          {},
          accessToken
        ),
        willRespondWith: pactJsonResponse(Matchers.like(errorResponse), 400),
      })

      try {
        await assignAssessingUser(recallId, blankUserId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(400)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPostRequest(
          'an unauthorized user accessToken',
          `/recalls/${recallId}/assignee/${userId}`,
          {},
          accessToken
        ),
        willRespondWith: { status: 401 },
      })

      try {
        await assignAssessingUser(recallId, userId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
