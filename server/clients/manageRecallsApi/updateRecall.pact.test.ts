// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { updateRecall } from './manageRecallsApiClient'
import * as configModule from '../../config'
import updateRecallResponseJson from '../../../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { ObjectMap } from '../../@types'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const recallLength = 'FOURTEEN_DAYS'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('update a recall', () => {
    test('can successfully add recommended recall length to a recall', async () => {
      await provider.addInteraction({
        state: 'a recall exists and can be updated with length',
        ...updateRecallRequest('an update recall request', recallId, { recallLength }, accessToken),
        willRespondWith: updateRecallResponse(Matchers.like(updateRecallResponseJson), 200),
      })

      const actual = await updateRecall(recallId, { recallLength }, accessToken)

      expect(actual).toEqual(updateRecallResponseJson)
    })

    test('can successfully add assessment agreement to a recall', async () => {
      const agreeWithRecallRecommendation = true
      await provider.addInteraction({
        state: 'a recall exists and can be updated with agreement',
        ...updateRecallRequest('an update recall request', recallId, { agreeWithRecallRecommendation }, accessToken),
        willRespondWith: updateRecallResponse(Matchers.like(updateRecallResponseJson), 200),
      })

      const actual = await updateRecall(recallId, { agreeWithRecallRecommendation }, accessToken)

      expect(actual).toEqual(updateRecallResponseJson)
    })

    test('can successfully add last release date to a recall', async () => {
      const lastReleaseDateTime = '2020-08-03T00:00:00.000Z'
      await provider.addInteraction({
        state: 'a recall exists and can be updated with last release date',
        ...updateRecallRequest('an update recall request', recallId, { lastReleaseDateTime }, accessToken),
        willRespondWith: updateRecallResponse(Matchers.like(updateRecallResponseJson), 200),
      })

      const actual = await updateRecall(recallId, { lastReleaseDateTime }, accessToken)

      expect(actual).toEqual(updateRecallResponseJson)
    })

    test('can successfully add last releasing prison to a recall', async () => {
      const lastReleasePrison = 'Belmarsh'
      await provider.addInteraction({
        state: 'a recall exists and can be updated with last releasing prison',
        ...updateRecallRequest('an update recall request', recallId, { lastReleasePrison }, accessToken),
        willRespondWith: updateRecallResponse(Matchers.like(updateRecallResponseJson), 200),
      })

      const actual = await updateRecall(recallId, { lastReleasePrison }, accessToken)

      expect(actual).toEqual(updateRecallResponseJson)
    })

    test('can successfully add local police service to a recall', async () => {
      const localPoliceService = 'Brentwood, Essex'
      await provider.addInteraction({
        state: 'a recall exists and can be updated with local police service',
        ...updateRecallRequest('an update recall request', recallId, { localPoliceService }, accessToken),
        willRespondWith: updateRecallResponse(Matchers.like(updateRecallResponseJson), 200),
      })

      const actual = await updateRecall(recallId, { localPoliceService }, accessToken)

      expect(actual).toEqual(updateRecallResponseJson)
    })

    test('can successfully add email received date/time to a recall', async () => {
      const recallEmailReceivedDateTime = '2020-12-05T15:33:57.000Z'
      await provider.addInteraction({
        state: 'a recall exists and can be updated with email received date',
        ...updateRecallRequest('an update recall request', recallId, { recallEmailReceivedDateTime }, accessToken),
        willRespondWith: updateRecallResponse(Matchers.like(updateRecallResponseJson), 200),
      })

      const actual = await updateRecall(recallId, { recallEmailReceivedDateTime }, accessToken)

      expect(actual).toEqual(updateRecallResponseJson)
    })

    test('returns 400 if blank recall length provided', async () => {
      const blankRecallLength = ''
      const errorResponse = {
        status: 'BAD_REQUEST',
        message: 'recallLength: must not be blank',
      }
      await provider.addInteraction({
        state: 'a recall exists and can be updated',
        ...updateRecallRequest(
          'an update recall request with blank recall length',
          recallId,
          { recallLength: blankRecallLength },
          accessToken
        ),
        willRespondWith: updateRecallResponse(Matchers.like(errorResponse), 400),
      })

      try {
        await updateRecall(recallId, { recallLength: blankRecallLength }, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(400)
        expect(exception.data).toEqual(errorResponse)
      }
    })

    test('returns 404 if recall not found', async () => {
      await provider.addInteraction({
        state: 'a recall does not exist',
        ...updateRecallRequest('an update recall request', recallId, { recallLength }, accessToken),
        willRespondWith: { status: 404 },
      })

      try {
        await updateRecall(recallId, { recallLength }, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(404)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...updateRecallRequest('an unauthorized update recall request', recallId, { recallLength }, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await updateRecall(recallId, { recallLength }, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})

function updateRecallRequest(description: string, recallId: string, body: ObjectMap<string | boolean>, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'PATCH',
      path: `/recalls/${recallId}`,
      headers: { Authorization: `Bearer ${token}` },
      body,
    },
  }
}

function updateRecallResponse(responseBody, expectedStatus = 200) {
  return {
    status: expectedStatus,
    headers: { 'Content-Type': 'application/json' },
    body: responseBody,
  }
}
