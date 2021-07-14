// @ts-nocheck
import { pactWith } from 'jest-pact'
import { searchByNomsNumber } from './manageRecallsApiClient'
import * as configModule from '../../config'
import { SearchResult } from '../../@types/manage-recalls-api'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const nomsNumber = 'A1234AA'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('search prisoners', () => {
    test('can find a prisoner by NOMS number', async () => {
      const expectedResult = expectedSearchResult(nomsNumber)
      await provider.addInteraction({
        state: `a prisoner exists for NOMS number`,
        ...searchRequest('a search request by NOMS number', nomsNumber, accessToken),
        willRespondWith: searchResponse([expectedResult], 200),
      })

      const actualResults = await searchByNomsNumber(nomsNumber, accessToken)

      expect(actualResults).toStrictEqual(expectedResult)
    })

    test('returns 400 if blank NOMS number provided', async () => {
      const blankNomsNumber = ''
      const errorResponse = {
        status: 'BAD_REQUEST',
        message: 'nomsNumber: must not be blank',
      }
      await provider.addInteraction({
        state: 'a search by blank NOMS number',
        ...searchRequest('a search request with blank NOMS number', blankNomsNumber, accessToken),
        willRespondWith: searchResponse(errorResponse, 400),
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
        ...searchRequest('an unauthorized search request', nomsNumber, accessToken),
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

function searchRequest(description: string, nomsNumber: string, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'POST',
      path: '/search',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      body: { nomsNumber },
    },
  }
}

function searchResponse(searchResults, expectedStatus = 200) {
  return {
    status: expectedStatus,
    headers: { 'Content-Type': 'application/json' },
    body: searchResults,
  }
}

function expectedSearchResult(nomsNumber): SearchResult {
  return {
    firstName: 'Bertie',
    middleNames: 'Barry',
    lastName: 'Badger',
    dateOfBirth: '1990-10-30',
    gender: 'Male',
    nomsNumber,
    croNumber: '1234/56A',
    pncNumber: '98/7654Z',
  }
}
