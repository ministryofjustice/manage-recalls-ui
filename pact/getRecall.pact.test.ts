// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getRecall } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import getRecallResponseJson from '../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  // TODO: refactoring: move duplicated set-up across all *.pact.test.ts to new base class?
  const accessToken = 'accessToken-1'
  const matchedRecallId = '00000000-0000-0000-0000-000000000000' // needs to be matched for some recalls/scenarios in API verify PACT

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get recall', () => {
    test('can successfully retrieve a recall without documents', async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactGetRequest('a get recall request', `/recalls/${matchedRecallId}`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getRecallResponseJson), 200),
      })

      const actual = await getRecall(matchedRecallId, accessToken)

      expect(actual).toEqual(getRecallResponseJson)
    })

    test('can successfully retrieve a recall with documents', async () => {
      await provider.addInteraction({
        state: 'a recall and document history exist',
        ...pactGetRequest('a get recall request', `/recalls/${matchedRecallId}`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getRecallResponseJson), 200),
      })

      const actual = await getRecall(matchedRecallId, accessToken)

      expect(actual).toEqual(getRecallResponseJson)
    })

    test('can successfully retrieve a recall with missingDocumentRecords', async () => {
      await provider.addInteraction({
        state: 'a recall with missing document records exists',
        ...pactGetRequest('a get recall request', `/recalls/${matchedRecallId}`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getRecallResponseJson), 200),
      })

      const actual = await getRecall(matchedRecallId, accessToken)

      expect(actual).toEqual(getRecallResponseJson)
    })

    test('can successfully retrieve a recall with lastKnownAddresses', async () => {
      await provider.addInteraction({
        state: 'a recall with last known addresses exists',
        ...pactGetRequest('a get recall request', `/recalls/${matchedRecallId}`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getRecallResponseJson), 200),
      })

      const actual = await getRecall(matchedRecallId, accessToken)

      expect(actual).toEqual(getRecallResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactGetRequest('an unauthorized get recall request', `/recalls/${matchedRecallId}`, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await getRecall(matchedRecallId, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
