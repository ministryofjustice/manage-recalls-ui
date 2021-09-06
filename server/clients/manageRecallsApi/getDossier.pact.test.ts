// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getDossier } from './manageRecallsApiClient'
import * as configModule from '../../config'
import getDossierResponseJson from '../../../fake-manage-recalls-api/stubs/__files/get-dossier.json'

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
        ...getDossierRequest('a get dossier request', recallId, accessToken),
        willRespondWith: getDossierResponse(Matchers.like(getDossierResponseJson), 200),
      })

      const actual = await getDossier(recallId, accessToken)

      expect(actual).toEqual(getDossierResponseJson)
    })
  })

  test('returns 401 if invalid user', async () => {
    await provider.addInteraction({
      state: 'an unauthorized user accessToken',
      ...getDossierRequest('an unauthorized get dossier request', recallId, accessToken),
      willRespondWith: { status: 401 },
    })

    try {
      await getDossier(recallId, accessToken)
    } catch (exception) {
      expect(exception.status).toEqual(401)
    }
  })
})

function getDossierRequest(description: string, recallId: string, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'GET',
      path: `/recalls/${recallId}/dossier`,
      headers: { Authorization: `Bearer ${token}` },
    },
  }
}

function getDossierResponse(responseBody, expectedStatus = 200) {
  return {
    status: expectedStatus,
    headers: { 'Content-Type': 'application/json' },
    body: responseBody,
  }
}
