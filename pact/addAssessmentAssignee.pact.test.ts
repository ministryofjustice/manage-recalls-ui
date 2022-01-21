// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { assignUserToRecall } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import getRecallResponseJson from '../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { pactJsonResponse, pactPostRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const userId = '11111111-1111-1111-1111-111111111111'
  const recallId = '00000000-0000-0000-0000-000000000000'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('assign user to recall assessment', () => {
    test('can assign a user', async () => {
      await provider.addInteraction({
        state: 'a user and an unassigned fully populated recall exists without documents',
        ...pactPostRequest('an assign user request', `/recalls/${recallId}/assignee/${userId}`, {}, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getRecallResponseJson), 200),
      })

      const actual = await assignUserToRecall(recallId, userId, accessToken)

      expect(actual).toEqual(getRecallResponseJson)
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
        await assignUserToRecall(recallId, userId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
