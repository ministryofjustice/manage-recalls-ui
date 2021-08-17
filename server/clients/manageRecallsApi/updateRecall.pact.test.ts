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
    test('can successfully add properties to a recall', async () => {
      const payload = {
        agreeWithRecallRecommendation: true,
        lastReleaseDate: '2020-08-03',
        contrabandDetail: 'Likely to bring in contraband because...',
        lastReleaseDateTime: '2020-08-03T00:00:00.000Z',
        lastReleasePrison: 'Belmarsh',
        localPoliceService: 'Brentwood, Essex',
        mappaLevel: 'LEVEL_2',
        recallEmailReceivedDateTime: '2020-12-05T15:33:57.000Z',
        vulnerabilityDiversityDetail: 'Has the following needs',
        sentenceDate: '2019-08-03',
        sentenceExpiryDate: '2021-02-03',
        licenceExpiryDate: '2021-08-03',
        conditionalReleaseDate: '2022-03-14',
        sentencingCourt: 'Manchester Crown Court',
        indexOffence: 'Burglary',
      }
      await provider.addInteraction({
        state: 'a recall exists and can be updated',
        ...updateRecallRequest('an update recall request', recallId, payload, accessToken),
        willRespondWith: updateRecallResponse(Matchers.like(updateRecallResponseJson), 200),
      })
      const actual = await updateRecall(recallId, payload, accessToken)
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
