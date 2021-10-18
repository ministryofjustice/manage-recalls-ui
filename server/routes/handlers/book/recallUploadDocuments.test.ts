// @ts-nocheck
import { getMockRes } from '@jest-mock/express'
import { getUploadedDocument, uploadRecallDocumentsFormHandler } from './recallUploadDocuments'
import { getStoredDocument, addRecallDocument } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { mockGetRequest } from '../../testutils/mockRequestUtils'
import { GetDocumentResponse } from '../../../@types/manage-recalls-api/models/GetDocumentResponse'
import { uploadStorageFields } from '../helpers/uploadStorage'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../helpers/uploadStorage')

describe('uploadRecallDocumentsFormHandler', () => {
  let req
  let resp

  const allFiles = {
    LICENCE: [
      {
        originalname: 'licence.pdf',
        buffer: 'abc',
        mimetype: 'application/pdf',
      },
    ],
    PRE_SENTENCING_REPORT: [
      {
        originalname: 'report.pdf',
        buffer: 'def',
        mimetype: 'application/pdf',
      },
    ],
    PREVIOUS_CONVICTIONS_SHEET: [
      {
        originalname: 'sheet.pdf',
        buffer: 'def',
        mimetype: 'application/pdf',
      },
    ],
    PART_A_RECALL_REPORT: [
      {
        originalname: 'report.pdf',
        buffer: 'def',
        mimetype: 'application/pdf',
      },
    ],
  }
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
      req.files = allFiles
      cb()
    })
    await uploadRecallDocumentsFormHandler(req, resp)
    expect(addRecallDocument).toHaveBeenCalledTimes(4)
    expect(req.session.errors).toBeUndefined()
  })

  it('creates errors if no documents are uploaded', async () => {
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = {}
      cb()
    })
    await uploadRecallDocumentsFormHandler(req, resp)
    expect(addRecallDocument).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        href: '#PART_A_RECALL_REPORT',
        name: 'PART_A_RECALL_REPORT',
        text: 'Select a part A recall report',
      },
      {
        href: '#LICENCE',
        name: 'LICENCE',
        text: 'Select a licence',
      },
      {
        href: '#PREVIOUS_CONVICTIONS_SHEET',
        name: 'PREVIOUS_CONVICTIONS_SHEET',
        text: 'Select a previous convictions sheet',
      },
      {
        href: '#PRE_SENTENCING_REPORT',
        name: 'PRE_SENTENCING_REPORT',
        text: 'Select a pre-sentencing report',
      },
    ])
  })

  it('creates errors for failed saves to the API', done => {
    ;(addRecallDocument as jest.Mock).mockRejectedValue(new Error('test'))
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = allFiles
      cb()
    })
    const res = {
      locals: { user: {} },
      redirect: () => {
        expect(req.session.errors).toEqual([
          {
            href: '#LICENCE',
            name: 'LICENCE',
            text: 'The licence could not be uploaded - try again',
          },
          {
            href: '#PRE_SENTENCING_REPORT',
            name: 'PRE_SENTENCING_REPORT',
            text: 'The pre-sentencing report could not be uploaded - try again',
          },
          {
            href: '#PREVIOUS_CONVICTIONS_SHEET',
            name: 'PREVIOUS_CONVICTIONS_SHEET',
            text: 'The previous convictions sheet could not be uploaded - try again',
          },
          {
            href: '#PART_A_RECALL_REPORT',
            name: 'PART_A_RECALL_REPORT',
            text: 'The part A recall report could not be uploaded - try again',
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
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      const copyOfFiles = JSON.parse(JSON.stringify(allFiles))
      copyOfFiles.LICENCE[0].originalname = 'licence.doc'
      copyOfFiles.PART_A_RECALL_REPORT[0].mimetype = 'application/msword'
      req.files = copyOfFiles
      cb()
    })
    const res = {
      locals: { user: {} },
      redirect: () => {
        expect(addRecallDocument).toHaveBeenCalledTimes(2) // for the two valid files
        expect(req.session.errors).toEqual([
          {
            href: '#PART_A_RECALL_REPORT',
            name: 'PART_A_RECALL_REPORT',
            text: 'The part A recall report must be a PDF',
          },
          {
            href: '#LICENCE',
            name: 'LICENCE',
            text: 'The licence must be a PDF',
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
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
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
      await getUploadedDocument(req, resp)
      expect(spies.contentType).toHaveBeenCalledWith('application/pdf')
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'inline; filename="Licence.pdf"')
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
      await getUploadedDocument(req, resp)
      expect(spies.contentType).toHaveBeenCalledWith('application/octet-stream')
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="email.msg"')
    })
  })
})
