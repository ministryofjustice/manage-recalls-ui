import nock from 'nock'
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../testutils/mockRequestUtils'
import config from '../../config'
import generateRevocationOrder from './generateRevocationOrder'

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('generateRevocationOrder', () => {
  let fakeManageRecallsApi: nock.Scope

  beforeEach(() => {
    fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('generateRevocationOrder', () => {
    it('should return pdf from manage recalls api', async () => {
      const expectedPdfContents = 'pdf contents'
      const expectedPdf = { content: Buffer.from(expectedPdfContents).toString('base64') }

      fakeManageRecallsApi
        .post('/generate-revocation-order')
        .matchHeader('authorization', `Bearer ${userToken.access_token}`)
        .reply(200, expectedPdf)

      const req = mockPostRequest({})
      const { res, next } = mockResponseWithAuthenticatedUser(userToken.access_token)

      await generateRevocationOrder()(req, res, next)

      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="revocation-order.pdf"',
      })
      expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents))
    })
  })
})
