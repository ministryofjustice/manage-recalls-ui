// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { generateRecallDocument } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import generateRecallDocumentResponseJson from '../fake-manage-recalls-api/stubs/__files/generate-recall-document.json'
import { pactPostRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const category = 'REVOCATION_ORDER'
  const details = 'Details changed.'
  const url = `/recalls/${recallId}/documents/generated`
  const fileName = 'BADGER BOBBY 12345C RECALL DOSSIER.pdf'
  const requestBody = { category, details, fileName }

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('generate recall documents', () => {
    test('can successfully generate a document', async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPostRequest('a generate recall document request', url, requestBody, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(generateRecallDocumentResponseJson), 201),
      })

      const actual = await generateRecallDocument(recallId, requestBody, accessToken)

      expect(actual).toEqual(generateRecallDocumentResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPostRequest('an unauthorized generate recall document request', url, requestBody, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await generateRecallDocument(recallId, requestBody, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
