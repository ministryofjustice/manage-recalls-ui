// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { getGeneratedDocument } from '../server/clients/manageRecallsApi/manageRecallsApiClient'
import * as configModule from '../server/config'
import getLetterResponseJson from '../fake-manage-recalls-api/stubs/__files/get-letter.json'
import { pactGetRequest, pactJsonResponse } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('get letter', () => {
    test('can successfully get a letter', async () => {
      await provider.addInteraction({
        state: 'a letter can be downloaded',
        ...pactGetRequest('a get letter request', `/recalls/${recallId}/letter-to-prison`, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(getLetterResponseJson), 200),
      })

      const actual = await getGeneratedDocument('letter-to-prison')({ recallId }, accessToken)

      expect(actual).toEqual(getLetterResponseJson)
    })
  })

  test('returns 401 if invalid user', async () => {
    await provider.addInteraction({
      state: 'an unauthorized user accessToken',
      ...pactGetRequest('an unauthorized get letter request', `/recalls/${recallId}/letter-to-prison`, accessToken),
      willRespondWith: { status: 401 },
    })

    try {
      await getGeneratedDocument('letter-to-prison')({ recallId }, accessToken)
    } catch (exception) {
      expect(exception.status).toEqual(401)
    }
  })
})
