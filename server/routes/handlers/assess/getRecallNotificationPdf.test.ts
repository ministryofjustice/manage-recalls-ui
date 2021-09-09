import nock from 'nock'
import { Request, Response } from 'express'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { getRecallNotificationPdf } from './getRecallNotificationPdf'
import config from '../../../config'
import recall from '../../../../fake-manage-recalls-api/stubs/__files/get-recall.json'

const nomsNumber = 'AA123AA'
const recallId = '123'

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('getRecallNotificationPdf', () => {
  describe('getRecallNotificationPdf', () => {
    const expectedPdfContents = 'pdf contents'
    const fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
    let req: Request
    let res: Response
    const person = {
      firstName: 'Bobby',
      lastName: 'Badger',
    }

    beforeEach(() => {
      req = mockGetRequest({ params: { nomsNumber, recallId } })
      const { res: resp } = mockResponseWithAuthenticatedUser(userToken.access_token)
      res = resp
    })

    afterEach(() => {
      jest.clearAllMocks()
      nock.cleanAll()
    })

    it('should return pdf from manage recalls api', async () => {
      fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
      fakeManageRecallsApi.post('/search').reply(200, [person])
      fakeManageRecallsApi.get(`/recalls/${recallId}/revocationOrder`).reply(200, { content: expectedPdfContents })
      await getRecallNotificationPdf(req, res)
      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="IN CUSTODY RECALL BOBBY BADGER A123456.pdf"`,
      })
      expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents, 'base64'))
    })

    it("should respond with 500 if PDF request isn't successful", async () => {
      fakeManageRecallsApi.get(`/recalls/${recallId}/revocationOrder`).replyWithError({
        code: '500',
      })
      fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
      fakeManageRecallsApi.post('/search').reply(200, [person])
      await getRecallNotificationPdf(req, res)
      expect(res.sendStatus).toHaveBeenCalledWith(500)
    })

    it("should return pdf without person name in the filename, if it can't get person details", async () => {
      fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
      fakeManageRecallsApi.post('/search').replyWithError({
        code: '404',
      })
      fakeManageRecallsApi.get(`/recalls/${recallId}/revocationOrder`).reply(200, { content: expectedPdfContents })
      await getRecallNotificationPdf(req, res)
      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="IN CUSTODY RECALL A123456.pdf"`,
      })
      expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents, 'base64'))
    })

    it("should return pdf without booking number in the filename, if it can't get recall", async () => {
      fakeManageRecallsApi.get(`/recalls/${recallId}`).replyWithError({
        code: '404',
      })
      fakeManageRecallsApi.post('/search').reply(200, [person])
      fakeManageRecallsApi.get(`/recalls/${recallId}/revocationOrder`).reply(200, { content: expectedPdfContents })
      await getRecallNotificationPdf(req, res)
      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="IN CUSTODY RECALL BOBBY BADGER.pdf"`,
      })
      expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents, 'base64'))
    })
  })
})
