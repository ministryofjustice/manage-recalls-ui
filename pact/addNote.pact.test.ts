// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { addNote } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import requestBody from '../fake-manage-recalls-api/stubs/__files/add-note.json'
import { pactJsonResponse, pactPostRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const user = { token: accessToken }
  const recallId = '00000000-0000-0000-0000-000000000000'

  const path = `/recalls/${recallId}/notes`

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('add note', () => {
    test('can successfully add a note', async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPostRequest('a full add note request', path, requestBody, accessToken),
        willRespondWith: { status: 201 },
      })

      const actual = await addNote({ recallId, valuesToSave: requestBody, user })

      expect(actual.status).toEqual(201)
    })

    test('can successfully add a note without a document', async () => {
      const valuesToSave = {
        subject: 'Some note subject',
        details: 'Some note details text',
      }
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPostRequest('a minimal add note request', path, valuesToSave, accessToken),
        willRespondWith: { status: 201 },
      })

      const actual = await addNote({ recallId, valuesToSave, user })

      expect(actual.status).toEqual(201)
    })

    test('returns 400 if blank details provided', async () => {
      const valuesToSave = {
        subject: 'Note without details',
      }
      const errorResponse = {
        status: 'BAD_REQUEST',
      }
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPostRequest('an add note request with missing details', path, valuesToSave, accessToken),
        willRespondWith: pactJsonResponse(Matchers.like(errorResponse), 400),
      })

      try {
        await addNote({ recallId, valuesToSave, user })
      } catch (exception) {
        expect(exception.status).toEqual(400)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPostRequest('an unauthorized add note request', path, requestBody, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await addNote({ recallId, valuesToSave: requestBody, user })
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
