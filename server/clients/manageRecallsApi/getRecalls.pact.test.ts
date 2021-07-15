// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getRecallList } from './manageRecallsApiClient'
import * as configModule from '../../config'
// TODO:  Ensure this json is of the correct type
import getRecallsResponseJson from '../../../fake-manage-recalls-api/stubs/__files/get-recalls.json'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get recalls', () => {
    test('can successfully retrieve a list of recalls', async () => {
      await provider.addInteraction({
        state: 'a list of recalls exists',
        ...getRecallsRequest('a get recalls request', accessToken),
        willRespondWith: getRecallsResponse(Matchers.like(getRecallsResponseJson), 200),
      })

      const actual = await getRecallList(accessToken)

      expect(actual).toEqual(getRecallsResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...getRecallsRequest('an unauthorized get recalls request', accessToken),
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

function getRecallsRequest(description: string, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'GET',
      path: '/recalls',
      headers: { Authorization: `Bearer ${token}` },
    },
  }
}

function getRecallsResponse(responseBody, expectedStatus = 200) {
  return {
    status: expectedStatus,
    headers: { 'Content-Type': 'application/json' },
    body: responseBody,
  }
}
