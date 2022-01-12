// @ts-nocheck
import { pactWith } from 'jest-pact'
import { prisonerByNomsNumber } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getPrisonerResponseJson from '../fake-manage-recalls-api/stubs/__files/get-prisoner.json'
import { pactJsonResponse, pactGetRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const nomsNumber = 'A1234AA'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get a prisoner', () => {
    test('can get a prisoner by NOMS number', async () => {
      await provider.addInteraction({
        state: `a prisoner exists for NOMS number`,
        ...pactGetRequest('a get request by NOMS number', `/prisoner/${nomsNumber}`, accessToken),
        willRespondWith: pactJsonResponse(getPrisonerResponseJson, 200),
      })

      const actualResult = await prisonerByNomsNumber(nomsNumber, accessToken)

      expect(actualResult).toStrictEqual(getPrisonerResponseJson)
    })

    test('returns 404 if blank NOMS number provided', async () => {
      const blankNomsNumber = ''
      await provider.addInteraction({
        state: 'no state required',
        ...pactGetRequest('a get prisoner request with blank NOMS number', `/prisoner/${blankNomsNumber}`, accessToken),
        willRespondWith: { status: 404 },
      })

      try {
        await prisonerByNomsNumber(blankNomsNumber, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(404)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactGetRequest('an unauthorized search request', `/prisoner/${nomsNumber}`, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await prisonerByNomsNumber(nomsNumber, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
