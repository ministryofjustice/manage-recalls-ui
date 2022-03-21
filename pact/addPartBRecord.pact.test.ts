// @ts-nocheck
import { pactWith } from 'jest-pact'
import { addPartbRecord } from '../server/clients/manageRecallsApiClient'
import * as configModule from '../server/config'
import { pactPostRequest } from './pactTestUtils'

pactWith({ consumer: 'manage-recalls-ui', provider: 'manage-recalls-api' }, provider => {
  const accessToken = 'accessToken-1'
  const user = { token: accessToken }
  const recallId = '00000000-0000-0000-0000-000000000000'
  const path = `/recalls/${recallId}/partb-records`

  const requestBody = {
    details: 'Some text about what i did',
    partBReceivedDate: '2022-03-05',
    partBFileName: 'my part b.pdf',
    partBFileContent: 'abc',
    emailFileName: 'part b email.msg',
    emailFileContent: 'def',
    oasysFileName: '2022 oasys.pdf',
    oasysFileContent: 'ghi',
  }

  beforeEach(() => {
    jest.spyOn(configModule, 'manageRecallsApiConfig').mockReturnValue({ url: provider.mockService.baseUrl })
  })

  describe('add a part B record', () => {
    test('can successfully add a record', async () => {
      await provider.addInteraction({
        state: 'a user and a fully populated recall without documents exists',
        ...pactPostRequest('an add part B record request', path, requestBody, accessToken),
        willRespondWith: { status: 201 },
      })
      const actual = await addPartbRecord({ recallId, valuesToSave: requestBody, user })
      expect(actual.status).toEqual(201)
    })

    test('returns 401 if invalid user', async () => {
      await provider.addInteraction({
        state: 'an unauthorized user accessToken',
        ...pactPostRequest('an unauthorized add record request', path, requestBody, accessToken),
        willRespondWith: { status: 401 },
      })
      try {
        await addPartbRecord({ recallId, valuesToSave: requestBody, user })
      } catch (exception) {
        expect(exception.status).toEqual(401)
      }
    })
  })
})
