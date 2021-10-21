// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { deleteAssessingUser } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getRecallResponseJson from '../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { pactJsonResponse, pactDeleteRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const userId = '00000000-0000-0000-0000-000000000000'
  const recallId = '123-456'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('unassign user from recall assessment', () => {
    test('can assign a user', async () => {
      const recallNoAssignee = { ...getRecallResponseJson, assignee: undefined }
      await provider.addInteraction({
        state: 'a user can be unassigned',
        ...pactDeleteRequest('an unassign user request', `/recalls/${recallId}/assignee/${userId}`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(recallNoAssignee), 200),
      })

      const actual = await deleteAssessingUser(recallId, userId, accessToken)

      expect(actual).toEqual(recallNoAssignee)
    })

    test('returns 400 if blank userId provided', async () => {
      const blankUserId = ''
      const errorResponse = {
        status: 'BAD_REQUEST',
      }
      await provider.addInteraction({
        state: 'a missing user ID',
        ...pactDeleteRequest(
          'an unassign user request with blank userId',
          `/recalls/${recallId}/assignee/${blankUserId}`,
          accessToken
        ),
        willRespondWith: pactJsonResponse(Matchers.like(errorResponse), 400),
      })

      try {
        await deleteAssessingUser(recallId, blankUserId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(400)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactDeleteRequest(
          'an unauthorized user accessToken',
          `/recalls/${recallId}/assignee/${userId}`,
          accessToken
        ),
        willRespondWith: { status: 401 },
      })

      try {
        await deleteAssessingUser(recallId, userId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
