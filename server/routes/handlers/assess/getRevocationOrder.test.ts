import nock from 'nock'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import config from '../../../config'
import getRevocationOrder from './getRevocationOrder'

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('getRevocationOrder', () => {
  let fakeManageRecallsApi: nock.Scope

  beforeEach(() => {
    fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getRevocationOrder', () => {
    it('should return pdf from manage recalls api', async () => {
      const expectedPdfContents = 'pdf contents'
      const expectedPdf = { content: Buffer.from(expectedPdfContents).toString('base64') }
      const recallId = 'RECALL_ID'

      fakeManageRecallsApi
        .get(`/recalls/${recallId}/revocationOrder`)
        .matchHeader('authorization', `Bearer ${userToken.access_token}`)
        .reply(200, expectedPdf)

      const req = mockGetRequest({ query: { recallId } })
      const { res, next } = mockResponseWithAuthenticatedUser(userToken.access_token)

      await getRevocationOrder()(req, res, next)

      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="revocation-order.pdf"',
      })
      expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents))
    })
  })
})