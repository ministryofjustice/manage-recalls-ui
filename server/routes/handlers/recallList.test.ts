import nock from 'nock'
import { Request, Response } from 'express'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../testutils/mockRequestUtils'
import { recallList } from './recallList'
import config from '../../config'
import recalls from '../../../fake-manage-recalls-api/stubs/__files/get-recalls.json'

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('recallList', () => {
  const fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  let req: Request
  let resp: Response

  beforeEach(() => {
    fakeManageRecallsApi.get('/recalls').reply(200, recalls)
    fakeManageRecallsApi
      .post('/search')
      .times(recalls.length)
      .reply(200, [
        {
          firstName: 'Bobby',
          lastName: 'Badger',
        },
      ])
    req = mockGetRequest({})
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)
    resp = res
  })

  it('should make recalls with person details available to render', async () => {
    await recallList(req, resp)
    expect(resp.locals.recalls).toEqual([
      {
        offender: {
          firstName: 'Bobby',
          lastName: 'Badger',
        },
        recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      {
        offender: {
          firstName: 'Bobby',
          lastName: 'Badger',
        },
        recallId: '8ab377a6-4587-2598-abc4-98fc53737',
      },
    ])
  })
})
