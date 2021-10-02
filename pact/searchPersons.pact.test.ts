// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { searchByNomsNumber } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import searchResponseJson from '../fake-manage-recalls-api/stubs/__files/search.json'
import { pactPostRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const nomsNumber = 'A1234AA'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('search prisoners', () => {
    test('can find a prisoner by NOMS number', async () => {
      await provider.addInteraction({
        state: `a prisoner exists for NOMS number`,
        ...pactPostRequest('a search request by NOMS number', '/search', { nomsNumber }, accessToken),
        willRespondWith: pactJsonResponse(searchResponseJson, 200),
      })

      const actualResults = await searchByNomsNumber(nomsNumber, accessToken)

      expect(actualResults).toStrictEqual(searchResponseJson[0])
    })

    test('returns 400 if blank NOMS number provided', async () => {
      const blankNomsNumber = ''
      const errorResponse = {
        status: 'BAD_REQUEST',
        message: 'nomsNumber: must not be blank',
      }
      await provider.addInteraction({
        state: 'a search by blank NOMS number',
        ...pactPostRequest(
          'a search request with blank NOMS number',
          '/search',
          { nomsNumber: blankNomsNumber },
          accessToken
        ),
        willRespondWith: pactJsonResponse(Matchers.like(errorResponse), 400),
      })

      try {
        await searchByNomsNumber(blankNomsNumber, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(400)
        expect(exception.data).toEqual(errorResponse)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPostRequest('an unauthorized search request', '/search', { nomsNumber }, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await searchByNomsNumber(nomsNumber, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
