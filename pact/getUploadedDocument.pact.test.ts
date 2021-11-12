// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getStoredDocument } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getRecallDocumentResponseJson from '../fake-manage-recalls-api/stubs/__files/get-recall-document.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const documentId = '11111111-0000-0000-0000-000000000000'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get uploaded recall documents', () => {
    test('can successfully retrieve a document', async () => {
      await provider.addInteraction({
        state: 'a document exists',
        ...pactGetRequest('a get recall document request', `/recalls/${recallId}/documents/${documentId}`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getRecallDocumentResponseJson), 200),
      })

      const actual = await getStoredDocument({ recallId, documentId }, accessToken)

      expect(actual).toEqual(getRecallDocumentResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactGetRequest(
          'an unauthorized get recall document request',
          `/recalls/${recallId}/documents/${documentId}`,
          accessToken
        ),
        willRespondWith: { status: 401 },
      })

      try {
        await getStoredDocument({ recallId, documentId }, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
