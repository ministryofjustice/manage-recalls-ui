// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { setDocumentCategory } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import setDocumentCategoryJson from '../fake-manage-recalls-api/stubs/__files/set-document-category.json'
import { pactJsonResponse, pactPatchRequest } from './pactTestUtils'
import { RecallDocument } from '../server/@types/manage-recalls-api/models/RecallDocument'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const documentId = '11111111-0000-0000-0000-000000000000'
  const category = RecallDocument.category.OASYS_RISK_ASSESSMENT

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('change the category of a document', () => {
    test('can successfully change a category', async () => {
      await provider.addInteraction({
        state: 'a recall and uncategorised document exist',
        ...pactPatchRequest(
          'an update category request',
          `/recalls/${recallId}/documents/${documentId}`,
          { category },
          accessToken
        ),
        willRespondWith: pactJsonResponse(Matchers.like(setDocumentCategoryJson), 200),
      })
      const actual = await setDocumentCategory(recallId, documentId, category, accessToken)
      expect(actual).toEqual(setDocumentCategoryJson)
    })

    test('returns 404 if document not found', async () => {
      const unknownDocumentId = '11100000-0000-0000-0000-000000000000'
      await provider.addInteraction({
        state: 'no state required',
        ...pactPatchRequest(
          'an update document request for a document that does not exist',
          `/recalls/${recallId}/documents/${unknownDocumentId}`,
          { category },
          accessToken
        ),
        willRespondWith: { status: 404 },
      })

      try {
        await setDocumentCategory(recallId, unknownDocumentId, category, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(404)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPatchRequest(
          'an unauthorized update document request',
          `/recalls/${recallId}/documents/${documentId}`,
          { category },
          accessToken
        ),
        willRespondWith: { status: 401 },
      })

      try {
        await setDocumentCategory(recallId, documentId, category, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
