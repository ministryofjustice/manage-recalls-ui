// @ts-nocheck
import { pactWith } from 'jest-pact'
import { addPhaseEndTime, addPhaseStartTime } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import { pactPatchRequest, pactPostRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const recallId = '00000000-0000-0000-0000-000000000000'
  const accessToken = 'accessToken-1'
  const user = { token: accessToken }

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('add a start of phase', () => {
    const path = `/recalls/${recallId}/start-phase`
    const valuesToSave = {
      phase: 'ASSESS',
    }

    test('can successfully add a start phase', async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPostRequest('an add start phase request', path, valuesToSave, accessToken),
        willRespondWith: { status: 201 },
      })

      const actual = await addPhaseStartTime({ recallId, valuesToSave, user })

      expect(actual.status).toEqual(201)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPostRequest('an unauthorized add start phase request', path, valuesToSave, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await addPhaseStartTime({ recallId, valuesToSave, user })
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })

  describe('add an end of phase', () => {
    const path = `/recalls/${recallId}/end-phase`
    const valuesToSave = {
      phase: 'BOOK',
      shouldUnassign: false,
    }

    test('can successfully add an end phase', async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPatchRequest('an add end phase request', path, valuesToSave, accessToken),
        willRespondWith: { status: 200 },
      })

      const actual = await addPhaseEndTime({ recallId, valuesToSave, user })

      expect(actual.status).toEqual(200)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPatchRequest('an unauthorized add end phase request', path, valuesToSave, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await addPhaseEndTime({ recallId, valuesToSave, user })
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
