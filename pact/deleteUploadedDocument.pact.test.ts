// @ts-nocheck
import { pactWith } from 'jest-pact'
import { deleteRecallDocument } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import { pactDeleteRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const documentId = '11111111-0000-0000-0000-000000000000'
  const recallId = '00000000-0000-0000-0000-000000000000'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('delete document from recall', () => {
    test('can delete a document', async () => {
      await provider.addInteraction({
        state: 'a recall in being booked on state with a document exists',
        ...pactDeleteRequest('a delete document request', `/recalls/${recallId}/documents/${documentId}`, accessToken),
        willRespondWith: { status: 204 },
      })

      const actual = await deleteRecallDocument(recallId, documentId, accessToken)

      expect(actual.status).toEqual(204)
    })

    test('returns 401 if invalid token', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactDeleteRequest(
          'an unauthorized user accessToken',
          `/recalls/${recallId}/documents/${documentId}`,
          accessToken
        ),
        willRespondWith: { status: 401 },
      })

      try {
        await deleteRecallDocument(recallId, documentId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
