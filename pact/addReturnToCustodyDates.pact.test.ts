// @ts-nocheck
import { pactWith } from 'jest-pact'
import { addReturnToCustodyDates } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import { pactPostRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const token = 'token-1'
  const user = { token }
  const recallId = '00000000-0000-0000-0000-000000000000'

  const valuesToSave = {
    returnedToCustodyDateTime: '2022-01-22T13:45:33.000Z',
    returnedToCustodyNotificationDateTime: '2022-01-23T08:22:06.000Z',
  }

  const path = `/recalls/${recallId}/returned-to-custody`

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('add return to custody dates', () => {
    test('can successfully add return to custody dates', async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPostRequest('an add return to custody dates request', path, valuesToSave, token),
        willRespondWith: { status: 200 },
      })

      const actual = await addReturnToCustodyDates({ recallId, valuesToSave, user })

      expect(actual.status).toEqual(200)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPostRequest('an unauthorized add return to custody dates request', path, valuesToSave, token),
        willRespondWith: { status: 401 },
      })

      try {
        await addReturnToCustodyDates({ recallId, valuesToSave, user })
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
