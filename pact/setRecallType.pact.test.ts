// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { setRecallType } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import setRecallTypeJson from '../fake-manage-recalls-api/stubs/__files/set-recall-type.json'
import { pactJsonResponse, pactPatchRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const user = { token: accessToken }
  const recallId = '00000000-0000-0000-0000-000000000000'
  const valuesToSave = {
    recallType: 'STANDARD',
  }

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('set the recall type', () => {
    test('can successfully change the recall type', async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPatchRequest(
          'an update recall type request',
          `/recalls/${recallId}/recall-type`,
          valuesToSave,
          accessToken
        ),
        willRespondWith: pactJsonResponse(Matchers.like(setRecallTypeJson), 200),
      })
      const actual = await setRecallType({ recallId, valuesToSave, user })
      expect(actual).toEqual(setRecallTypeJson)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPatchRequest(
          'an unauthorized update recall type request',
          `/recalls/${recallId}/recall-type`,
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
