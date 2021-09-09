// @ts-nocheck
import { getMockRes } from '@jest-mock/express'
import nock from 'nock'
import { uploadDocumentsPage, downloadDocument, uploadRecallDocumentsFormHandler } from './recallUploadDocuments'
import { getRecallDocument, addRecallDocument } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { GetDocumentResponse } from '../../../@types/manage-recalls-api/models/GetDocumentResponse'
import recall from '../../../../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { uploadStorageFields } from '../helpers/uploadStorage'
import config from '../../../config'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../helpers/uploadStorage')

describe('uploadDocumentsPage', () => {
  const fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  const nomsNumber = 'AA123AA'
  const recallId = '00000000-0000-0000-0000-000000000000'

  beforeEach(() => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.post('/search').reply(200, [
      {
        firstName: 'Bobby',
        lastName: 'Badger',
      },
    ])
  })

  it("doesn't include email documents for display", async () => {
    const req = mockGetRequest({
      params: { nomsNumber, recallId },
    })
    const { res } = mockResponseWithAuthenticatedUser('')
    await uploadDocumentsPage(req, res)
    expect(res.locals.documentTypes.find(doc => doc.type === 'email')).toBeUndefined()
  })
})

describe('uploadRecallDocumentsFormHandler', () => {
  let req
  let resp
  beforeEach(() => {
    req = mockGetRequest({ params: { nomsNumber: '456', recallId: '789' } })
    const { res } = getMockRes({
      locals: { user: {} },
    })
    resp = res
  })

  afterEach(() => jest.resetAllMocks())

  it('sends uploaded documents to the API', async () => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = {
        LICENCE: [
          {
            originalname: 'licence.pdf',
            buffer: 'abc',
          },
        ],
        PRE_SENTENCING_REPORT: [
          {
            originalname: 'report.pdf',
            buffer: 'def',
          },
        ],
      }
      cb()
    })
    await uploadRecallDocumentsFormHandler(req, resp)
    expect(addRecallDocument).toHaveBeenCalledTimes(2)
    expect(req.session.errors).toBeUndefined()
  })

  it('creates an error if no documents are uploaded', async () => {
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = {}
      cb()
    })
    await uploadRecallDocumentsFormHandler(req, resp)
    expect(addRecallDocument).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        name: 'documents',
        text: 'You must upload at least one document',
      },
    ])
  })

  it('creates errors for failed uploads', done => {
    ;(addRecallDocument as jest.Mock).mockRejectedValue(new Error('test'))
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = {
        LICENCE: [
          {
            originalname: 'licence.pdf',
            buffer: 'abc',
          },
        ],
        PRE_SENTENCING_REPORT: [
          {
            originalname: 'report.pdf',
            buffer: 'def',
          },
        ],
      }
      cb()
    })
    const res = {
      locals: { user: {} },
      redirect: () => {
        expect(req.session.errors).toEqual([
          {
            fileName: 'licence.pdf',
            href: '#LICENCE',
            name: 'LICENCE',
            text: 'licence.pdf - an error occurred during upload',
          },
          {
            fileName: 'report.pdf',
            href: '#PRE_SENTENCING_REPORT',
            name: 'PRE_SENTENCING_REPORT',
            text: 'report.pdf - an error occurred during upload',
          },
        ])
        done()
      },
    }
    uploadRecallDocumentsFormHandler(req, res)
  })
})

describe('downloadDocument', () => {
  let spies
  let req
  let resp

  beforeEach(() => {
    spies = {
      contentType: jest.fn(),
      header: jest.fn(),
      send: jest.fn(),
    }
    req = mockGetRequest({ params: { nomsNumber: '456', recallId: '789' } })
    const { res } = getMockRes({
      ...spies,
      locals: { user: {} },
    })
    resp = res
  })

  describe('PDF', () => {
    it('sets headers so the document is opened not downloaded', async () => {
      ;(getRecallDocument as jest.Mock).mockResolvedValue({
        documentId: '123',
        category: GetDocumentResponse.category.LICENCE,
        content: 'abc',
      })
      await downloadDocument(req, resp)
      expect(spies.contentType).toHaveBeenCalledWith('application/pdf')
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'inline; filename="licence.pdf"')
    })
  })

  describe('Email', () => {
    it('sets headers so the email is downloaded not opened', async () => {
      ;(getRecallDocument as jest.Mock).mockResolvedValue({
        documentId: '123',
        category: GetDocumentResponse.category.RECALL_NOTIFICATION_EMAIL,
        content: 'abc',
        fileName: 'recall-notification.msg',
      })
      await downloadDocument(req, resp)
      expect(spies.contentType).toHaveBeenCalledWith('application/octet-stream')
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="recall-notification.msg"')
    })
  })
})
