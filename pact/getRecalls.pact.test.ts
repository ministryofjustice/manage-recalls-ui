// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getRecallList } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import getRecallsResponseJson from '../fake-manage-recalls-api/stubs/__files/get-recalls.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get recalls', () => {
    test('can successfully retrieve a list of recalls', async () => {
      await provider.addInteraction({
        state: 'a list of recalls exists',
        ...pactGetRequest('a get recalls request', '/recalls', accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getRecallsResponseJson), 200),
      })

      const actual = await getRecallList(accessToken)

      expect(actual).toEqual(getRecallsResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactGetRequest('an unauthorized get recalls request', '/recalls', accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await getRecallList(accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
