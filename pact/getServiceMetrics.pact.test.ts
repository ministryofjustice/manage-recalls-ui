// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getServiceMetrics } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import getServiceMetricsResponseJson from '../fake-manage-recalls-api/stubs/__files/get-summary-statistics.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const path = '/statistics/summary'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get service metrics', () => {
    test('can successfully retrieve service metrics', async () => {
      await provider.addInteraction({
        state: 'summary statistics exist',
        ...pactGetRequest('a get service metrics request', path, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getServiceMetricsResponseJson), 200),
      })
      const actual = await getServiceMetrics(accessToken)
      expect(actual).toEqual(getServiceMetricsResponseJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactGetRequest('an unauthorized get service metrics request', path, accessToken),
        willRespondWith: { status: 401 },
      })
      try {
        await getServiceMetrics(accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
