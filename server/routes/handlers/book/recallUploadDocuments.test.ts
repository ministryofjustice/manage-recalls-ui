// @ts-nocheck
import { getMockRes } from '@jest-mock/express'
import { uploadRecallDocumentsFormHandler } from './recallUploadDocuments'
import {
  getRecall,
  addRecallDocument,
  deleteRecallDocument,
  setDocumentCategory,
} from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { getPerson } from '../helpers/personCache'
import { mockGetRequest } from '../../testutils/mockRequestUtils'
import { GetDocumentResponse } from '../../../@types/manage-recalls-api/models/GetDocumentResponse'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { uploadStorageArray } from '../helpers/uploadStorage'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../helpers/uploadStorage')
jest.mock('../helpers/personCache')

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
      originalname: 'PreCons Wesley Holt.pdf',
      buffer: 'def',
      mimetype: 'application/pdf',
    },
    {
      originalname: 'Barry Badger PART_A_REPORT.pdf',
      buffer: 'def',
      mimetype: 'application/pdf',
    },
    {
      originalname: '2021-10-09charge-Sheet-Maria Badger.pdf',
      buffer: 'hgf',
      mimetype: 'application/pdf',
    },
    {
      originalname: 'other.pdf',
      buffer: 'hgf',
      mimetype: 'application/pdf',
    },
  ]
  const nomsNumber = '456'
  const recallId = '789'
  const person = { firstName: 'Bobby', lastName: 'Badger' }

  beforeEach(() => {
    req = mockGetRequest({ params: { nomsNumber, recallId } })
    const { res } = getMockRes({
      locals: { user: {} },
    })
    resp = res
  })

  afterEach(() => jest.resetAllMocks())

  it('renders newly uploaded documents only, to insert (XHR request)', done => {
    const files = [
      {
        originalname: 'PreCons Wesley Holt.pdf',
        buffer: 'def',
        mimetype: 'application/pdf',
      },
    ]
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.xhr = true
      req.body.existingDocIds = '["3fa85f64-5717-4562-b3fc-2c963f66afa6"]'
      req.files = files
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence Wesley Holt.pdf',
        },
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'PreCons Wesley Holt.pdf',
        },
      ],
    })
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    resp.render = (partial, data) => {
      expect(data.recall.documentsUploaded).toHaveLength(1)
      expect(data.recall.documentsUploaded[0]).toHaveProperty('category', 'PREVIOUS_CONVICTIONS_SHEET')
      expect(data.recall.documentsUploaded[0]).toHaveProperty('documentId', '1234-5717-4562-b3fc-2c963f66afa6')
      expect(data.recall.addToExistingUploads).toEqual(true)
      done()
    }
    uploadRecallDocumentsFormHandler(req, resp)
  })

  it('renders all uploaded documents, to replace (XHR request)', done => {
    const files = [
      {
        originalname: 'PreCons Wesley Holt.pdf',
        buffer: 'def',
        mimetype: 'application/pdf',
      },
    ]
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.xhr = true
      req.files = files
      req.body.existingDocIds = '[]'
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'PreCons Wesley Holt.pdf',
        },
      ],
    })
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    resp.render = (partial, data) => {
      expect(data.recall.documents).toHaveLength(1)
      expect(data.recall.documents[0]).toHaveProperty('category', 'PREVIOUS_CONVICTIONS_SHEET')
      expect(data.recall.documents[0]).toHaveProperty('documentId', '1234-5717-4562-b3fc-2c963f66afa6')
      expect(data.recall.addToExistingUploads).toEqual(false)
      done()
    }
    uploadRecallDocumentsFormHandler(req, resp)
  })

  it("doesn't try to save to the API if there are no uploaded files", async () => {
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = []
      cb()
    })
    await uploadRecallDocumentsFormHandler(req, resp)
    expect(addRecallDocument).not.toHaveBeenCalled()
  })

  it('autocategorises uploaded documents then sends them to the API', async () => {
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
      category: 'LICENCE',
      fileContent: 'abc',
      fileName: 'licence.pdf',
    })
    expect(addRecallDocument.mock.calls[1][1]).toEqual({
      category: 'UNCATEGORISED',
      fileContent: 'def',
      fileName: 'report.pdf',
    })
    expect(addRecallDocument.mock.calls[2][1]).toEqual({
      category: 'PREVIOUS_CONVICTIONS_SHEET',
      fileContent: 'def',
      fileName: 'PreCons Wesley Holt.pdf',
    })
    expect(addRecallDocument.mock.calls[3][1]).toEqual({
      category: 'PART_A_RECALL_REPORT',
      fileContent: 'def',
      fileName: 'Barry Badger PART_A_REPORT.pdf',
    })
    expect(addRecallDocument.mock.calls[4][1]).toEqual({
      category: 'CHARGE_SHEET',
      fileContent: 'hgf',
      fileName: '2021-10-09charge-Sheet-Maria Badger.pdf',
    })
    expect(addRecallDocument.mock.calls[5][1]).toEqual({
      category: 'UNCATEGORISED',
      fileContent: 'hgf',
      fileName: 'other.pdf',
    })
    expect(req.session.errors).toBeUndefined()
  })

  it('saves category changes for existing uploads', async () => {
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = []
      cb()
    })
    ;(setDocumentCategory as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    req.body = {
      'category-a0388485-315b-4630-b230-33f808047633': 'PREVIOUS_CONVICTIONS_SHEET',
      'category-8f13251d-26f0-4e5b-8fbb-259ca97e8669': 'PRE_SENTENCING_REPORT',
      continue: 'continue',
    }
    await uploadRecallDocumentsFormHandler(req, resp)
    expect(setDocumentCategory).toHaveBeenCalledTimes(2)
    expect(addRecallDocument).not.toHaveBeenCalled()
  })

  it("doesn't process category changes if category is forced", async () => {
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = [
        {
          originalname: 'PreCons Wesley Holt.pdf',
          buffer: 'def',
          mimetype: 'application/pdf',
        },
      ]
      cb()
    })
    req.body = {
      forceCategory: 'PREVIOUS_CONVICTIONS_SHEET',
      continue: 'continue',
    }
    await uploadRecallDocumentsFormHandler(req, resp)
    expect(setDocumentCategory).not.toHaveBeenCalled()
    expect(addRecallDocument).toHaveBeenCalledTimes(1)
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
            text: 'PreCons Wesley Holt.pdf could not be uploaded - try again',
          },
          {
            href: '#documents',
            name: 'documents',
            text: 'Barry Badger PART_A_REPORT.pdf could not be uploaded - try again',
          },
          {
            name: 'documents',
            text: '2021-10-09charge-Sheet-Maria Badger.pdf could not be uploaded - try again',
            href: '#documents',
          },
          {
            name: 'documents',
            text: 'other.pdf could not be uploaded - try again',
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

  it('creates an error if a second copy of a document category is uploaded', done => {
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = allFiles
      req.body = {
        'category-123': 'LICENCE',
      }
      cb()
    })
    const res = {
      locals: { user: {} },
      redirect: () => {
        expect(addRecallDocument).toHaveBeenCalledTimes(5) // for the 5 valid files
        expect(req.session.errors).toEqual([
          {
            href: '#documents',
            name: 'documents',
            text: 'You can only upload one licence',
          },
        ])
        done()
      },
    }
    uploadRecallDocumentsFormHandler(req, res)
  })

  it("redirects to Check your answers if a fromPage isn't supplied", done => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = allFiles
      req.body = {
        continue: 'continue',
      }
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence Wesley Holt.pdf',
        },
        {
          category: 'PART_A_RECALL_REPORT',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Part A Wesley Holt.pdf',
        },
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Pre Cons Wesley Holt.pdf',
        },
        {
          category: 'OASYS_RISK_ASSESSMENT',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'OAsys Wesley Holt.pdf',
        },
      ],
    })
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    const res = {
      locals: {
        user: {},
        urlInfo: {
          basePath: `/persons/123/recalls/456/`,
        },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(`/persons/123/recalls/456/check-answers`)
        done()
      },
    }
    uploadRecallDocumentsFormHandler(req, res)
  })

  it('redirects to fromPage if one is supplied in res.locals', done => {
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

  it("redirects to Missing documents if a required doc isn't supplied", done => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = allFiles
      req.body = {
        continue: 'continue',
      }
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence Wesley Holt.pdf',
        },
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Pre Cons Wesley Holt.pdf',
        },
        {
          category: 'OASYS_RISK_ASSESSMENT',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'OAsys Wesley Holt.pdf',
        },
      ],
    })
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    const res = {
      locals: {
        user: {},
        urlInfo: {
          basePath: `/persons/123/recalls/456/`,
        },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(`/persons/123/recalls/456/missing-documents`)
        done()
      },
    }
    uploadRecallDocumentsFormHandler(req, res)
  })

  it("redirects to Missing documents if a required doc isn't supplied", done => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = allFiles
      req.body = {
        continue: 'continue',
      }
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence Wesley Holt.pdf',
        },
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Pre Cons Wesley Holt.pdf',
        },
        {
          category: 'OASYS_RISK_ASSESSMENT',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'OAsys Wesley Holt.pdf',
        },
      ],
    })
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    const res = {
      locals: {
        user: {},
        urlInfo: {
          basePath: `/persons/123/recalls/456/`,
        },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(`/persons/123/recalls/456/missing-documents`)
        done()
      },
    }
    uploadRecallDocumentsFormHandler(req, res)
  })

  it('adds a fromPage querystring to Missing documents URL if one is present', done => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = allFiles
      req.body = {
        continue: 'continue',
      }
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence Wesley Holt.pdf',
        },
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Pre Cons Wesley Holt.pdf',
        },
        {
          category: 'OASYS_RISK_ASSESSMENT',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'OAsys Wesley Holt.pdf',
        },
      ],
    })
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    const res = {
      locals: {
        user: {},
        urlInfo: {
          basePath: `/persons/123/recalls/456/`,
          fromPage: 'assess',
          fromHash: 'documents',
        },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(`/persons/123/recalls/456/missing-documents?fromPage=assess#documents`)
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
