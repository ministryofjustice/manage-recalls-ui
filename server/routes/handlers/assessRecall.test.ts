import nock from 'nock'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../testutils/mockRequestUtils'
import config from '../../config'
import { assessRecall, getFormattedRecallLength } from './assessRecall'
import getRecallResponse from '../../../fake-manage-recalls-api/stubs/__files/get-recall.json'
import findPersonResponse from '../../../fake-manage-recalls-api/stubs/__files/search.json'
import { RecallResponse } from '../../@types/manage-recalls-api/models/RecallResponse'

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('assessRecall', () => {
  let fakeManageRecallsApi: nock.Scope

  beforeEach(() => {
    fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should render the assess recall view', async () => {
    const recallId = '123'

    fakeManageRecallsApi.get('/recalls/123').reply(200, getRecallResponse)

    fakeManageRecallsApi.post('/search').reply(200, findPersonResponse)

    const req = mockGetRequest({ params: { recallId } })
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)

    await assessRecall(req, res)

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
