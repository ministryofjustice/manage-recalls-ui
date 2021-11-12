// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getGeneratedDocument } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getDossierResponseJson from '../fake-manage-recalls-api/stubs/__files/get-dossier.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get dossier', () => {
    test('can successfully get a dossier', async () => {
      await provider.addInteraction({
        state: 'a dossier can be downloaded',
        ...pactGetRequest('a get dossier request', `/recalls/${recallId}/dossier`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getDossierResponseJson), 200),
      })

      const actual = await getGeneratedDocument('dossier')({ recallId }, accessToken)

      expect(actual).toEqual(getDossierResponseJson)
    })
  })

  test('returns 401 if invalid user', async () => {
    await provider.addInteraction({
      state: 'an unauthorized user accessToken',
      ...pactGetRequest('an unauthorized get dossier request', `/recalls/${recallId}/dossier`, accessToken),
      willRespondWith: { status: 401 },
    })

    try {
      await getGeneratedDocument('dossier')({ recallId }, accessToken)
    } catch (exception) {
      expect(exception.status).toEqual(401)
    }
  })
})
