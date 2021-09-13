import nock from 'nock'
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import config from '../../../config'
import { createRecall } from './createRecall'

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('createRecall', () => {
  let fakeManageRecallsApi: nock.Scope

  beforeEach(() => {
    fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should return a recall ID', async () => {
    const recallId = '123'
    const nomsNumber = '123ABC'

    fakeManageRecallsApi
      .post('/recalls')
      .matchHeader('authorization', `Bearer ${userToken.access_token}`)
      .reply(200, { recallId })

    const req = mockPostRequest({ params: { nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)

    await createRecall(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/pre-cons-name`)
  })
})
