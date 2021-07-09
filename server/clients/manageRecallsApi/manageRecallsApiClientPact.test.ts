import { pactWith } from 'jest-pact'
import { searchByNomsNumber } from './manageRecallsApiClient'
import * as configModule from '../../config'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const token = { access_token: 'token-1', expires_in: 300 }
  const nomsNumber = 'A1234AA'

  describe('search prisoners', () => {
    test('can find a prisoner by NOMS number', async () => {
      jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl } as never)

      const expectedResult = {
        firstName: 'Bertie',
        lastName: 'Badger',
        nomsNumber,
        dateOfBirth: '1990-10-30',
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await provider.addInteraction({
        state: `prisoner exists for NOMS number`,
        ...searchRequest('a search request by NOMS number', nomsNumber),
        willRespondWith: searchResponse([expectedResult], 200),
      })

      const actualResults = await searchByNomsNumber(nomsNumber, token.access_token)

      expect(actualResults).toStrictEqual(expectedResult)
    })

    test('returns 400 if blank NOMS number provided', async () => {
      const blankNomsNumber = ''
      const errorResponse = {
        status: 'BAD_REQUEST',
        message: 'nomsNumber: must not be blank',
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await provider.addInteraction({
        state: 'search by blank NOMS number',
        ...searchRequest('a search request with blank NOMS number', blankNomsNumber),
        willRespondWith: searchResponse(errorResponse, 400),
      })

      try {
        await searchByNomsNumber(blankNomsNumber, token.access_token)
      } catch (exception) {
        expect(exception.status).toEqual(400)
        expect(exception.data).toEqual(errorResponse)
      }
    })

    test('returns 401 if invalid user', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await provider.addInteraction({
        state: 'unauthorized user token',
        ...searchRequest('an unauthorized search request', nomsNumber),
        willRespondWith: { status: 401 },
      })

      try {
        await searchByNomsNumber(nomsNumber, token.access_token)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })

  function searchRequest(description: string, nomsNumber: string) {
    return {
      uponReceiving: description,
      withRequest: {
        method: 'POST',
        path: '/search',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token.access_token}` },
        body: { nomsNumber },
      },
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  function searchResponse(searchResults, expectedStatus = 200) {
    return {
      status: expectedStatus,
      headers: { 'Content-Type': 'application/json' },
      body: searchResults,
    }
  }
})
