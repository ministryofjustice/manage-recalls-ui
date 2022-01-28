// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { createRecall } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import createRecallResponseJson from '../fake-manage-recalls-api/stubs/__files/create-recall.json'
import { pactJsonResponse, pactPostRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const requestBody = {
    nomsNumber: 'A1234AA',
    firstName: 'Bobby',
    lastName: 'Badger',
    middleNames: 'Bryan',
    croNumber: '1234/56A',
    dateOfBirth: '1999-05-28',
  }

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('create a recall', () => {
    test('can successfully create a recall', async () => {
      await provider.addInteraction({
        state: 'no state required',
        ...pactPostRequest('a create recall request', '/recalls', requestBody, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(createRecallResponseJson), 201),
      })

      const actual = await createRecall(requestBody, accessToken)

      expect(actual).toEqual(createRecallResponseJson)
    })

    test('returns 400 if blank fields provided', async () => {
      const blankBody = {
        nomsNumber: '',
        firstName: '',
        lastName: '',
        middleNames: '',
        croNumber: '',
        dateOfBirth: '',
      }
      const errorResponse = {
        status: 'BAD_REQUEST',
        message: 'nomsNumber: must not be blank',
      }
      await provider.addInteraction({
        state: 'a user exists',
        ...pactPostRequest('a create recall request with blank nomsNumber', '/recalls', blankBody, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(errorResponse), 400),
      })

      try {
        await createRecall(blankBody, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(400)
        expect(exception.data).toEqual(errorResponse)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPostRequest('an unauthorized create recall request', '/recalls', requestBody, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await createRecall(requestBody, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
