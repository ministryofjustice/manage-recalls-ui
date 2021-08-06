import nock from 'nock'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import config from '../../../config'
import { assessRecallView, getFormattedRecallLength } from './assessRecall'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('assessRecallView', () => {
  let fakeManageRecallsApi: nock.Scope

  beforeEach(() => {
    fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  const recall = {
    recallId: '123',
    nomsNumber: 'A1234AA',
    recallLength: 'FOURTEEN_DAYS',
    documents: [
      {
        category: 'LICENCE',
        documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
    ],
  }

  const person = {
    firstName: 'Bobby',
    middleNames: 'John',
    lastName: 'Badger',
    dateOfBirth: '1999-05-28',
    gender: 'Male',
    nomsNumber: 'A1234AA',
    croNumber: '1234/56A',
    pncNumber: '98/7654Z',
  }

  it('should render the assess recall view', async () => {
    const recallId = '123'
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.post('/search').reply(200, [person])
    const req = mockGetRequest({ params: { recallId } })
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)

    await assessRecallView('assessRecall')(req, res)

    expect(res.locals.recall.recallLengthFormatted).toEqual('14 days')
    expect(res.render).toHaveBeenCalledWith('pages/assessRecall')
  })
})

describe('getFormattedRecallLength', () => {
  it('returns a string if recall length is 14 days', () => {
    const value = getFormattedRecallLength(RecallResponse.recallLength.FOURTEEN_DAYS)
    expect(value).toEqual('14 days')
  })

  it('returns a string if recall length is 28 days', () => {
    const value = getFormattedRecallLength(RecallResponse.recallLength.TWENTY_EIGHT_DAYS)
    expect(value).toEqual('28 days')
  })

  it('returns an empty string if recall length is empty', () => {
    const value = getFormattedRecallLength()
    expect(value).toEqual('')
  })
})
