import nock from 'nock'
import { Request, Response } from 'express'
import { mockGetRequest, mockResponseWithAuthenticatedUserAndUserId } from '../../../testutils/mockRequestUtils'
import {
  downloadDossier,
  downloadLetterToPrison,
  downloadReasonsForRecallOrder,
  downloadRecallNotification,
} from './downloadNamedPdfHandler'
import config from '../../../../config'
import recall from '../../../../../fake-manage-recalls-api/stubs/__files/get-recall.json'

const nomsNumber = 'AA123AA'
const recallId = '123'
const userId = '321'
const documentId = '88'

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('downloadNamedPdfHandler', () => {
  const expectedPdfContents = 'pdf contents'
  const fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  let req: Request
  let res: Response
  const person = {
    firstName: 'Bobby',
    lastName: 'Badger',
  }

  beforeEach(() => {
    req = mockGetRequest({ params: { nomsNumber, recallId, documentId } })
    const { res: resp } = mockResponseWithAuthenticatedUserAndUserId(userToken.access_token, userId)
    res = resp
  })

  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should return recall notification from manage recalls api', async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.post('/search').reply(200, [person])
    fakeManageRecallsApi.get(`/recalls/${recallId}/recallNotification`).reply(200, { content: expectedPdfContents })
    await downloadRecallNotification(req, res)
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="IN CUSTODY RECALL BADGER BOBBY A123456.pdf"`,
    })
    expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents, 'base64'))
  })

  it('should return letter from manage recalls api', async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.post('/search').reply(200, [person])
    fakeManageRecallsApi.get(`/recalls/${recallId}/letter-to-prison`).reply(200, { content: expectedPdfContents })
    await downloadLetterToPrison(req, res)
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="BADGER BOBBY A123456 LETTER TO PRISON.pdf"`,
    })
    expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents, 'base64'))
  })

  it('should return dossier from manage recalls api', async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.post('/search').reply(200, [person])
    fakeManageRecallsApi.get(`/recalls/${recallId}/dossier`).reply(200, { content: expectedPdfContents })
    await downloadDossier(req, res)
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="BADGER BOBBY A123456 RECALL DOSSIER.pdf"`,
    })
    expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents, 'base64'))
  })

  it('should return reasons for recall from manage recalls api', async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.post('/search').reply(200, [person])
    fakeManageRecallsApi
      .get(`/recalls/${recallId}/documents/${documentId}`)
      .reply(200, { content: expectedPdfContents })
    await downloadReasonsForRecallOrder(req, res)
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="BADGER BOBBY A123456 REASONS FOR RECALL.pdf"`,
    })
    expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents, 'base64'))
  })

  it("should respond with 500 if PDF request isn't successful", async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}/recallNotification`).replyWithError({
      code: '500',
    })
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.post('/search').reply(200, [person])
    await downloadRecallNotification(req, res)
    expect(res.sendStatus).toHaveBeenCalledWith(500)
  })

  it("should return pdf without person name in the filename, if it can't get person details", async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.post('/search').replyWithError({
      code: '404',
    })
    fakeManageRecallsApi.get(`/recalls/${recallId}/dossier`).reply(200, { content: expectedPdfContents })
    await downloadDossier(req, res)
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="  A123456 RECALL DOSSIER.pdf"`,
    })
    expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents, 'base64'))
  })

  it("should return pdf without booking number in the filename, if it can't get recall", async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).replyWithError({
      code: '404',
    })
    fakeManageRecallsApi.post('/search').reply(200, [person])
    fakeManageRecallsApi.get(`/recalls/${recallId}/dossier`).reply(200, { content: expectedPdfContents })
    await downloadDossier(req, res)
    expect(res.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="BADGER BOBBY RECALL DOSSIER.pdf"`,
    })
    expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents, 'base64'))
  })
})