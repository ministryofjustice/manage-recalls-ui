import nock from 'nock'
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../testutils/mockRequestUtils'
import config from '../../config'
import createRecall from './createRecall'

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('createRecall', () => {
  let fakeManageRecallsApi: nock.Scope

  beforeEach(() => {
    fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should return pdf from manage recalls api', async () => {
    const recallId = '123'
    const nomsNumber = '123ABC'

    fakeManageRecallsApi
      .post('/create-recall')
      .matchHeader('authorization', `Bearer ${userToken.access_token}`)
      .reply(200, { uuid: recallId })

    const req = mockPostRequest({ nomsNumber })
    const { res, next } = mockResponseWithAuthenticatedUser(userToken.access_token)

    await createRecall()(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/offender-profile?nomsNumber=${nomsNumber}&recallId=${recallId}`)
  })
})
