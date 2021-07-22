// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { createRecall } from './manageRecallsApiClient'
import * as configModule from '../../config'
import createRecallResponseJson from '../../../fake-manage-recalls-api/stubs/__files/create-recall.json'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const nomsNumber = 'A1234AA'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('create a recall', () => {
    test('can successfully create a recall', async () => {
      await provider.addInteraction({
        state: 'a recall can be created',
        ...createRecallRequest('a create recall request', nomsNumber, accessToken),
        willRespondWith: createRecallResponse(Matchers.like(createRecallResponseJson), 201),
      })

      const actual = await createRecall(nomsNumber, accessToken)

      expect(actual).toEqual(createRecallResponseJson)
    })

    test('returns 400 if blank NOMS number provided', async () => {
      const blankNomsNumber = ''
      const errorResponse = {
        status: 'BAD_REQUEST',
        message: 'nomsNumber: must not be blank',
      }
      await provider.addInteraction({
        state: 'a recall can be created',
        ...createRecallRequest('a create recall request with blank nomsNumber', blankNomsNumber, accessToken),
        willRespondWith: createRecallResponse(Matchers.like(errorResponse), 400),
      })

      try {
        await createRecall(blankNomsNumber, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(400)
        expect(exception.data).toEqual(errorResponse)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...createRecallRequest('an unauthorized create recall request', nomsNumber, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await createRecall(nomsNumber, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})

function createRecallRequest(description: string, nomsNumber: string, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'POST',
      path: '/recalls',
      headers: { Authorization: `Bearer ${token}` },
      body: { nomsNumber },
    },
  }
}

function createRecallResponse(responseBody, expectedStatus = 200) {
  return {
    status: expectedStatus,
    headers: { 'Content-Type': 'application/json' },
    body: responseBody,
  }
}
