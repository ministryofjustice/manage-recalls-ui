// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getRecallDocument } from './manageRecallsApiClient'
import * as configModule from '../../config'
import getRecallDocumentResponseJson from '../../../fake-manage-recalls-api/stubs/__files/get-recall-document.json'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const documentId = '11111111-0000-0000-0000-000000000000'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get recall documents', () => {
    test('can successfully retrieve a document', async () => {
      await provider.addInteraction({
        state: 'a document exists',
        ...getRecallDocumentRequest('a get recall document request', recallId, documentId, accessToken),
        willRespondWith: getRecallDocumentResponse(Matchers.like(getRecallDocumentResponseJson), 200),
      })

      const actual = await getRecallDocument(recallId, documentId, accessToken)

      expect(actual).toEqual(getRecallDocumentResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...getRecallDocumentRequest('an unauthorized get recall document request', recallId, documentId, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await getRecallDocument(recallId, documentId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})

function getRecallDocumentRequest(description: string, recallId: string, documentId: string, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'GET',
      path: `/recalls/${recallId}/documents/${documentId}`,
      headers: { Authorization: `Bearer ${token}` },
    },
  }
}

function getRecallDocumentResponse(responseBody, expectedStatus = 200) {
  return {
    status: expectedStatus,
    headers: { 'Content-Type': 'application/json' },
    body: responseBody,
  }
}
