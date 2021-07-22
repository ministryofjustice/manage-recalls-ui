// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { createRecallDocument } from './manageRecallsApiClient'
import * as configModule from '../../config'
import createRecallDocumentResponseJson from '../../../fake-manage-recalls-api/stubs/__files/create-recall-document.json'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const category = 'PART_A'
  const content = 'blahblahblah'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('create recall documents', () => {
    test('can successfully create a document', async () => {
      await provider.addInteraction({
        state: 'a document can be created',
        ...createRecallDocumentRequest('a create recall document request', recallId, accessToken),
        willRespondWith: createRecallDocumentResponse(Matchers.like(createRecallDocumentResponseJson), 200),
      })

      const actual = await createRecallDocument(recallId, category, content, accessToken)

      expect(actual).toEqual(createRecallDocumentResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...createRecallDocumentRequest('an unauthorized create recall document request', recallId, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await createRecallDocument(recallId, category, content, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})

function createRecallDocumentRequest(description: string, recallId: string, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'POST',
      path: `/recalls/${recallId}/documents`,
      headers: { Authorization: `Bearer ${token}` },
    },
  }
}

function createRecallDocumentResponse(responseBody, expectedStatus = 201) {
  return {
    status: expectedStatus,
    headers: { 'Content-Type': 'application/json' },
    body: responseBody,
  }
}
