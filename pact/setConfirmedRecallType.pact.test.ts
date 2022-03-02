// @ts-nocheck
import { pactWith } from 'jest-pact'
import { setConfirmedRecallType } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import { pactPatchRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const user = { token: accessToken }
  const recallId = '00000000-0000-0000-0000-000000000000'
  const valuesToSave = {
    confirmedRecallType: 'STANDARD',
    confirmedRecallTypeDetail: 'Details...',
  }

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('set the confirmed recall type', () => {
    test('can successfully change the confirmed recall type', async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated FIXED recall without documents exists',
        ...pactPatchRequest(
          'an update confirmed recall type request',
          `/recalls/${recallId}/confirmed-recall-type`,
          valuesToSave,
          accessToken
        ),
        willRespondWith: { status: 200 },
      })
      const actual = await setConfirmedRecallType({ recallId, valuesToSave, user })
      expect(actual.status).toEqual(200)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPatchRequest(
          'an unauthorized update confirmed recall type request',
          `/recalls/${recallId}/confirmed-recall-type`,
          valuesToSave,
          accessToken
        ),
        willRespondWith: { status: 401 },
      })

      try {
        await setConfirmedRecallType({ recallId, valuesToSave, user })
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
