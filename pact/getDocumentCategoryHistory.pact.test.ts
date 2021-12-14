// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getDocumentCategoryHistory } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getDocumentCategoryHistoryResponseJson from '../fake-manage-recalls-api/stubs/__files/get-document-category-history.json'
import { pactGetRequestWithQuery, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const token = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const category = 'LICENCE'
  const path = `/recalls/${recallId}/documents`
  const query = `category=${category}`

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get uploaded recall document history', () => {
    test("can successfully retrieve a document category's history", async () => {
      await provider.addInteraction({
        state: 'a recall and document history exist',
        ...pactGetRequestWithQuery({ description: 'a get recall document history request', path, query, token }),
        willRespondWith: pactJsonResponse(Matchers.like(getDocumentCategoryHistoryResponseJson), 200),
      })

      const actual = await getDocumentCategoryHistory(recallId, category, token)
      expect(actual).toEqual(getDocumentCategoryHistoryResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactGetRequestWithQuery({
          description: 'an unauthorized get recall document history request',
          path,
          query,
          token,
        }),
        willRespondWith: { status: 401 },
      })

      try {
        await getDocumentCategoryHistory(recallId, category, token)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
