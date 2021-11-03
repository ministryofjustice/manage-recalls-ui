// @ts-nocheck
import { getMockRes } from '@jest-mock/express'
import { downloadUploadedDocumentOrEmail, uploadRecallDocumentsFormHandler } from './recallUploadDocuments'
import {
  getRecall,
  addRecallDocument,
  deleteRecallDocument,
} from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { mockGetRequest } from '../../testutils/mockRequestUtils'
import { GetDocumentResponse } from '../../../@types/manage-recalls-api/models/GetDocumentResponse'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { uploadStorageArray } from '../helpers/uploadStorage'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../helpers/uploadStorage')

describe('uploadRecallDocumentsFormHandler', () => {
  let req
  let resp

  const allFiles = [
    {
      originalname: 'licence.pdf',
      buffer: 'abc',
      mimetype: 'application/pdf',
    },
    {
      originalname: 'report.pdf',
      buffer: 'def',
      mimetype: 'application/pdf',
    },
    {
      originalname: 'sheet.pdf',
      buffer: 'def',
      mimetype: 'application/pdf',
    },
    {
      originalname: 'report.pdf',
      buffer: 'def',
      mimetype: 'application/pdf',
    },
    {
      originalname: 'test.pdf',
      buffer: 'hgf',
      mimetype: 'application/pdf',
    },
    {
      originalname: 'test2.pdf',
      buffer: 'hgf',
      mimetype: 'application/pdf',
    },
  ]
  const nomsNumber = '456'
  const recallId = '789'

  beforeEach(() => {
    req = mockGetRequest({ params: { nomsNumber, recallId } })
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
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = allFiles
      cb()
    })
    await uploadRecallDocumentsFormHandler(req, resp)
    expect(addRecallDocument).toHaveBeenCalledTimes(6)
    expect(addRecallDocument.mock.calls[0][1]).toEqual({
      category: 'UNCATEGORISED',
      fileContent: 'abc',
      fileName: 'licence.pdf',
    })
    expect(addRecallDocument.mock.calls[1][1]).toEqual({
      category: 'UNCATEGORISED',
      fileContent: 'def',
      fileName: 'report.pdf',
    })
    expect(addRecallDocument.mock.calls[2][1]).toEqual({
      category: 'UNCATEGORISED',
      fileContent: 'def',
      fileName: 'sheet.pdf',
    })
    expect(addRecallDocument.mock.calls[3][1]).toEqual({
      category: 'UNCATEGORISED',
      fileContent: 'def',
      fileName: 'report.pdf',
    })
    expect(addRecallDocument.mock.calls[4][1]).toEqual({
      category: 'UNCATEGORISED',
      fileContent: 'hgf',
      fileName: 'test.pdf',
    })
    expect(addRecallDocument.mock.calls[5][1]).toEqual({
      category: 'UNCATEGORISED',
      fileContent: 'hgf',
      fileName: 'test2.pdf',
    })
    expect(req.session.errors).toBeUndefined()
  })

  it('creates errors for failed saves to the API', done => {
    ;(addRecallDocument as jest.Mock).mockRejectedValue({ data: 'Error' })
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = allFiles
      cb()
    })
    const res = {
      locals: { user: {} },
      redirect: () => {
        expect(req.session.errors).toEqual([
          {
            href: '#documents',
            name: 'documents',
            text: 'licence.pdf could not be uploaded - try again',
          },
          {
            href: '#documents',
            name: 'documents',
            text: 'report.pdf could not be uploaded - try again',
          },
          {
            href: '#documents',
            name: 'documents',
            text: 'sheet.pdf could not be uploaded - try again',
          },
          {
            href: '#documents',
            name: 'documents',
            text: 'report.pdf could not be uploaded - try again',
          },
          {
            name: 'documents',
            text: 'test.pdf could not be uploaded - try again',
            href: '#documents',
          },
          {
            name: 'documents',
            text: 'test2.pdf could not be uploaded - try again',
            href: '#documents',
          },
        ])
        done()
      },
    }
    uploadRecallDocumentsFormHandler(req, res)
  })

  it('creates an error for a failed save to the API due to a virus', done => {
    ;(addRecallDocument as jest.Mock).mockRejectedValue({
      data: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = [
        {
          originalname: 'licence.pdf',
          buffer: 'abc',
          mimetype: 'application/pdf',
        },
      ]
      cb()
    })
    const res = {
      locals: { user: {} },
      redirect: () => {
        expect(req.session.errors).toEqual([
          {
            href: '#documents',
            name: 'documents',
            text: 'licence.pdf contains a virus',
          },
        ])
        done()
      },
    }
    uploadRecallDocumentsFormHandler(req, res)
  })

  it('creates errors for files with either invalid file extensions or MIME types', done => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      const copyOfFiles = JSON.parse(JSON.stringify(allFiles))
      copyOfFiles[0].originalname = 'licence.doc'
      copyOfFiles[1].mimetype = 'application/msword'
      req.files = copyOfFiles
      cb()
    })
    const res = {
      locals: { user: {} },
      redirect: () => {
        expect(addRecallDocument).toHaveBeenCalledTimes(4) // for the 4 valid files
        expect(req.session.errors).toEqual([
          {
            href: '#documents',
            name: 'documents',
            text: "The selected file 'licence.doc' must be a PDF",
          },
          {
            href: '#documents',
            name: 'documents',
            text: "The selected file 'report.pdf' must be a PDF",
          },
        ])
        done()
      },
    }
    uploadRecallDocumentsFormHandler(req, res)
  })

  it('should redirect to fromPage if one is supplied in res.locals', done => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = allFiles
      cb()
    })
    const res = {
      locals: {
        user: {},
        urlInfo: {
          basePath: `/persons/123/recalls/456/`,
          fromPage: 'dossier-recall',
        },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(`/persons/123/recalls/456/dossier-recall`)
        done()
      },
    }
    uploadRecallDocumentsFormHandler(req, res)
  })

  it('deletes a document', done => {
    const documentId = '123'
    const fromPage = 'check-answers'
    const userToken = '000'
    const fileName = 'licence.pdf'
    const basePath = `/persons/${nomsNumber}/recalls/${recallId}/`
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      status: RecallResponse.status.BEING_BOOKED_ON,
      documents: [
        {
          documentId,
          category: GetDocumentResponse.category.LICENCE,
          fileName,
          content: 'abc',
        },
      ],
    })
    req.body = {
      delete: documentId,
    }
    req.originalUrl = `${basePath}upload-documents`
    const res = {
      locals: {
        user: {
          token: userToken,
        },
        urlInfo: {
          basePath,
          fromPage,
        },
      },
      redirect: (httpStatus, path) => {
        expect(req.session.confirmationMessage).toEqual({
          text: `${fileName} has been deleted`,
          type: 'success',
        })
        expect(deleteRecallDocument).toHaveBeenCalledWith(recallId, documentId, userToken)
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(req.originalUrl)
        done()
      },
    }
    uploadRecallDocumentsFormHandler(req, res)
  })

  it('errors if document deletion fails', done => {
    const documentId = '123'
    const fromPage = 'check-answers'
    const userToken = '000'
    const fileName = 'licence.pdf'
    const basePath = `/persons/${nomsNumber}/recalls/${recallId}/`
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      status: RecallResponse.status.BEING_BOOKED_ON,
      documents: [
        {
          documentId,
          category: GetDocumentResponse.category.LICENCE,
          fileName,
          content: 'abc',
        },
      ],
    })
    ;(deleteRecallDocument as jest.Mock).mockRejectedValue(new Error('test'))
    req.body = {
      delete: documentId,
    }
    req.originalUrl = `${basePath}upload-documents`
    const res = {
      locals: {
        user: {
          token: userToken,
        },
        urlInfo: {
          basePath,
          fromPage,
        },
      },
      redirect: (httpStatus, path) => {
        expect(req.session.confirmationMessage).toBeUndefined()
        expect(req.session.errors).toEqual([
          {
            name: 'saveError',
            text: 'An error occurred saving your changes',
          },
        ])
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(req.originalUrl)
        done()
      },
    }
    uploadRecallDocumentsFormHandler(req, res)
  })

  it('errors if deletion is attempted when fromPage is invalid', done => {
    const documentId = '123'
    const fromPage = 'view-recall'
    const userToken = '000'
    const fileName = 'licence.pdf'
    const basePath = `/persons/${nomsNumber}/recalls/${recallId}/`
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      status: RecallResponse.status.BEING_BOOKED_ON,
      documents: [
        {
          documentId,
          category: GetDocumentResponse.category.LICENCE,
          fileName,
          content: 'abc',
        },
      ],
    })
    req.body = {
      delete: documentId,
    }
    req.originalUrl = `${basePath}upload-documents`
    const res = {
      locals: {
        user: {
          token: userToken,
        },
        urlInfo: {
          basePath,
          fromPage,
        },
      },
      redirect: (httpStatus, path) => {
        expect(req.session.confirmationMessage).toBeUndefined()
        expect(req.session.errors).toEqual([
          {
            name: 'saveError',
            text: 'An error occurred saving your changes',
          },
        ])
        expect(deleteRecallDocument).not.toHaveBeenCalled()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(req.originalUrl)
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
      ;(getStoredDocument as jest.Mock).mockResolvedValue({
        documentId: '123',
        category: GetDocumentResponse.category.LICENCE,
        content: 'abc',
      })
      await downloadUploadedDocumentOrEmail(req, resp)
      expect(spies.contentType).toHaveBeenCalledWith('application/pdf')
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'inline; filename="Licence.pdf"')
    })

    it('uses original filename if no category filename available (eg Other docs)', async () => {
      ;(getStoredDocument as jest.Mock).mockResolvedValue({
        documentId: '123',
        category: GetDocumentResponse.category.OTHER,
        content: 'abc',
        fileName: 'test.pdf',
      })
      await downloadUploadedDocumentOrEmail(req, resp)
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'inline; filename="test.pdf"')
    })
  })

  describe('Email', () => {
    it('sets headers so the email is downloaded not opened', async () => {
      ;(getStoredDocument as jest.Mock).mockResolvedValue({
        documentId: '123',
        category: GetDocumentResponse.category.RECALL_NOTIFICATION_EMAIL,
        content: 'abc',
        fileName: 'email.msg',
      })
      await downloadUploadedDocumentOrEmail(req, resp)
      expect(spies.contentType).toHaveBeenCalledWith('application/octet-stream')
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="email.msg"')
    })
  })
})
