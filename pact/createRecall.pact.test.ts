// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { createRecall } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import createRecallResponseJson from '../fake-manage-recalls-api/stubs/__files/create-recall.json'
import { pactJsonResponse, pactPostRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const nomsNumber = 'A1234AA'
  const createdByUserId = '11111111-1111-1111-1111-111111111111'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('create a recall', () => {
    test('can successfully create a recall', async () => {
      await provider.addInteraction({
        state: 'a recall can be created',
        ...pactPostRequest('a create recall request', '/recalls', { nomsNumber, createdByUserId }, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(createRecallResponseJson), 201),
      })

      const actual = await createRecall(nomsNumber, createdByUserId, accessToken)

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
        ...pactPostRequest(
          'a create recall request with blank nomsNumber',
          '/recalls',
          { nomsNumber: blankNomsNumber, createdByUserId },
          accessToken
        ),
        willRespondWith: pactJsonResponse(Matchers.like(errorResponse), 400),
      })

      try {
        await createRecall(blankNomsNumber, createdByUserId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(400)
        expect(exception.data).toEqual(errorResponse)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPostRequest(
          'an unauthorized create recall request',
          '/recalls',
          { nomsNumber, createdByUserId },
          accessToken
        ),
        willRespondWith: { status: 401 },
      })

      try {
        await createRecall(nomsNumber, createdByUserId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
