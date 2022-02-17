import nock from 'nock'
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../testUtils/mockRequestUtils'
import * as config from '../../config'
import { assignUser } from './assignUser'
import { ApiConfig } from '../../config'

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('assignAssessment', () => {
  let fakeManageRecallsApi: nock.Scope

  beforeEach(() => {
    fakeManageRecallsApi = nock(config.default.apis.manageRecallsApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should redirect to the assess recall page', async () => {
    const recallId = '123'
    const nomsNumber = '123ABC'
    const userId = '123'

    fakeManageRecallsApi
      .post(`/recalls/${recallId}/assignee/${userId}`)
      .matchHeader('authorization', `Bearer ${userToken.access_token}`)
      .reply(200, { recallId })

    const req = mockPostRequest({ params: { nomsNumber, recallId } })
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)
    res.locals.user.uuid = userId
    res.locals.urlInfo = {
      basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
    }

    await assignUser({ nextPageUrlSuffix: 'assess' })(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/assess`)
  })

  it('should reload the page if the assignment fails', async () => {
    const recallId = '123'
    const nomsNumber = '123ABC'
    const userId = '123'
    jest.spyOn(config, 'manageRecallsApiConfig').mockReturnValue({ timeout: { response: 1, deadline: 1 } } as ApiConfig)
    fakeManageRecallsApi
      .post(`/recalls/${recallId}/assignee/${userId}`)
      .matchHeader('authorization', `Bearer ${userToken.access_token}`)
      .reply(500)

    const req = mockPostRequest({ params: { nomsNumber, recallId } })
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)
    res.locals.user.uuid = userId
    res.locals.urlInfo = {
      basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
    }

    await assignUser({ nextPageUrlSuffix: 'assess' })(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, '/')
  })
})
