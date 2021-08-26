// @ts-nocheck
import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'
import { updateRecall } from './manageRecallsApiClient'
import * as configModule from '../../config'
import fullyPopulatedRecallJson from '../../../fake-manage-recalls-api/stubs/__files/get-recall.json'
import recallWithSentencingInfoJson from '../../../fake-manage-recalls-api/stubs/__files/get-recall-with-sentencing-info.json'
import emptyRecallJson from '../../../fake-manage-recalls-api/stubs/__files/get-recall-empty.json'
import { ObjectMap } from '../../@types'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const indexOffence = 'robbery'

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('update a recall', () => {
    test('can successfully add all properties to a recall', async () => {
      const request = {
        agreeWithRecallRecommendation: true,
        lastReleaseDate: '2020-08-03',
        contrabandDetail: 'Likely to bring in contraband because...',
        lastReleaseDateTime: '2020-08-03T00:00:00.000Z',
        lastReleasePrison: 'Belmarsh',
        localPoliceForce: 'Essex',
        mappaLevel: 'LEVEL_2',
        recallEmailReceivedDateTime: '2020-12-05T15:33:57.000Z',
        vulnerabilityDiversityDetail: 'Has the following needs',
        sentenceDate: '2019-08-03',
        sentenceExpiryDate: '2021-02-03',
        licenceExpiryDate: '2021-08-03',
        conditionalReleaseDate: '2022-03-14',
        sentencingCourt: 'Manchester Crown Court',
        indexOffence: 'Burglary',
        sentenceLength: {
          years: 2,
          months: 3,
        },
        bookingNumber: 'A123456',
        probationOfficerName: 'Dave Angel',
        probationOfficerPhoneNumber: '07473739388',
        probationOfficerEmail: 'probation.office@justice.com',
        probationDivision: 'LONDON',
        authorisingAssistantChiefOfficer: 'Bob Monkfish',
        licenceConditionsBreached: '(i) one \n (ii) two',
        reasonsForRecall: ['OTHER', 'ELM_FAILURE_CHARGE_BATTERY'],
        reasonsForRecallOtherDetail: 'other reason detail...',
        currentPrison: 'BLI',
      }
      await provider.addInteraction({
        state: 'a recall exists and can be updated',
        ...updateRecallRequest('an update recall request', recallId, request, accessToken),
        willRespondWith: updateRecallResponse(Matchers.like(fullyPopulatedRecallJson), 200),
      })
      const actual = await updateRecall(recallId, request, accessToken)
      expect(actual).toEqual(fullyPopulatedRecallJson)
    })

    test('can successfully add sentencing info to an existing recall', async () => {
      const request = {
        sentenceDate: '2019-08-03',
        licenceExpiryDate: '2021-08-03',
        sentenceExpiryDate: '2021-02-03',
        sentencingCourt: 'Manchester Crown Court',
        indexOffence: 'Burglary',
        conditionalReleaseDate: '2022-03-14',
        sentenceLength: {
          years: 2,
          months: 3,
          days: 20,
        },
      }
      await provider.addInteraction({
        state: 'an empty recall exists and can be updated with sentencing info',
        ...updateRecallRequest('an update recall request with sentencing info', recallId, request, accessToken),
        willRespondWith: updateRecallResponse(Matchers.like(recallWithSentencingInfoJson), 200),
      })
      const actual = await updateRecall(recallId, request, accessToken)
      expect(actual).toEqual(recallWithSentencingInfoJson)
    })

    test('does not update recall with sentencing info if sentenceDate is missing', async () => {
      const payload = {
        licenceExpiryDate: '2021-08-03',
        sentenceExpiryDate: '2021-02-03',
        sentencingCourt: 'Manchester Crown Court',
        indexOffence: 'Burglary',
        conditionalReleaseDate: '2022-03-14',
        sentenceLength: {
          years: 2,
          months: 3,
          days: 20,
        },
      }
      await provider.addInteraction({
        state: 'an empty recall exists and will not be updated',
        ...updateRecallRequest(
          'an update recall request with sentence info and no sentenceDate',
          recallId,
          payload,
          accessToken
        ),
        willRespondWith: updateRecallResponse(Matchers.like(emptyRecallJson), 200),
      })
      const actual = await updateRecall(recallId, payload, accessToken)
      expect(actual).toEqual(emptyRecallJson)
    })

    test('returns 404 if recall not found', async () => {
      await provider.addInteraction({
        state: 'a recall does not exist',
        ...updateRecallRequest('an update recall request', recallId, { indexOffence }, accessToken),
        willRespondWith: { status: 404 },
      })

      try {
        await updateRecall(recallId, { indexOffence }, accessToken)
      } catch (exception) {
        expect(exception.status).toEqual(404)
      }
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...updateRecallRequest('an unauthorized update recall request', recallId, { indexOffence }, accessToken),
        willRespondWith: { status: 401 },
      })

      try {
        await updateRecall(recallId, { indexOffence }, accessToken)
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
