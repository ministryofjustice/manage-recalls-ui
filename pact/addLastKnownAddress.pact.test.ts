// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { addLastKnownAddress } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import valuesToSave from '../fake-manage-recalls-api/stubs/__files/add-address.json'
import { pactJsonResponse, pactPostRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const user = { token: accessToken }
  const path = '/last-known-addresses'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('add last known address', () => {
    test('can successfully add a last known address', async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPostRequest('an add address request', path, valuesToSave, accessToken),
        willRespondWith: { status: 201 },
      })

      const actual = await addLastKnownAddress({ valuesToSave, user })

      expect(actual.status).toEqual(201)
    })

    test('returns 400 if blank fields provided', async () => {
      const emptyBody = {}
      const errorResponse = {
        status: 'BAD_REQUEST',
      }
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPostRequest('an add address request with blank fields', path, emptyBody, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(errorResponse), 400),
      })

      try {
        await addLastKnownAddress({ valuesToSave: emptyBody, user })
      } catch (exception) {
        expect(exception.status).toEqual(400)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPostRequest('an unauthorized add address request', path, valuesToSave, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await addLastKnownAddress({ valuesToSave, user })
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
