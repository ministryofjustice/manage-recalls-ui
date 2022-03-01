// @ts-nocheck
import { pactWith } from 'jest-pact'
import { setRecallType } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import setRecallTypeJson from '../fake-manage-recalls-api/stubs/__files/set-recommended-recall-type.json'
import { pactPatchRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const user = { token: accessToken }
  const recallId = '00000000-0000-0000-0000-000000000000'
  const valuesToSave = setRecallTypeJson

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('set the recommended recall type', () => {
    test('can successfully change the recommended recall type', async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPatchRequest(
          'an update recommended recall type request',
          `/recalls/${recallId}/recommended-recall-type`,
          valuesToSave,
          accessToken
        ),
        willRespondWith: { status: 200 },
      })
      const actual = await setRecallType({ recallId, valuesToSave, user })
      expect(actual.status).toEqual(200)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPatchRequest(
          'an unauthorized update recommended recall type request',
          `/recalls/${recallId}/recommended-recall-type`,
          valuesToSave,
          accessToken
        ),
        willRespondWith: { status: 401 },
      })

      try {
        await setRecallType({ recallId, valuesToSave, user })
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
