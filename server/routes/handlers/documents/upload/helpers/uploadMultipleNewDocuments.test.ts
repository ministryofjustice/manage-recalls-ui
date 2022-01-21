// @ts-nocheck
import { uploadRecallDocument, getRecall } from '../../../../../clients/manageRecallsApiClient'
import { getPerson } from '../../../helpers/personCache'
import { uploadMultipleNewDocuments } from './uploadMultipleNewDocuments'

jest.mock('../../../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../../../helpers/personCache')

describe('uploadMultipleNewDocuments', () => {
  let req
  let res

  const nomsNumber = '456'
  const recallId = '789'
  const person = { firstName: 'Bobby', lastName: 'Badger' }

  beforeEach(() => {
    req = {
      params: { nomsNumber, recallId },
      xhr: true,
      body: {
        existingDocIds: '[]',
      },
      files: [],
      session: {},
    }
    res = {
      locals: { user: { token: 'token' } },
      json: jest.fn(),
    }
  })

  afterEach(() => jest.resetAllMocks())

  it('renders newly uploaded documents only, to insert (XHR request)', done => {
    req.files = [
      {
        originalname: 'PreCons Wesley Holt.pdf',
        buffer: 'def',
        mimetype: 'application/pdf',
      },
    ]
    req.body.existingDocIds = '["3fa85f64-5717-4562-b3fc-2c963f66afa6"]'
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
    res.render = (partial, data) => {
      expect(data.recall.documentsUploaded).toHaveLength(1)
      expect(data.recall.documentsUploaded[0]).toHaveProperty('category', 'PREVIOUS_CONVICTIONS_SHEET')
      expect(data.recall.documentsUploaded[0]).toHaveProperty('documentId', '1234-5717-4562-b3fc-2c963f66afa6')
      expect(data.recall.addToExistingUploads).toEqual(true)
      done()
    }
    uploadMultipleNewDocuments(req, res)
  })

  it('renders all uploaded documents, to replace (XHR request)', done => {
    req.files = [
      {
        originalname: 'PreCons Wesley Holt.pdf',
        buffer: 'def',
        mimetype: 'application/pdf',
      },
    ]
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
    res.render = (partial, data) => {
      expect(data.recall.documents).toHaveLength(1)
      expect(data.recall.documents[0]).toHaveProperty('category', 'PREVIOUS_CONVICTIONS_SHEET')
      expect(data.recall.documents[0]).toHaveProperty('documentId', '1234-5717-4562-b3fc-2c963f66afa6')
      expect(data.recall.addToExistingUploads).toEqual(false)
      done()
    }
    uploadMultipleNewDocuments(req, res)
  })

  it("doesn't try to save to the API if there are no uploaded files", async () => {
    req.files = []
    await uploadMultipleNewDocuments(req, res)
    expect(uploadRecallDocument).not.toHaveBeenCalled()
  })

  it('creates errors for failed saves to the API', done => {
    ;(uploadRecallDocument as jest.Mock).mockRejectedValue({ data: 'Error' })
    req.files = [
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
    res.json = () => {
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
    }
    uploadMultipleNewDocuments(req, res)
  })

  it('creates an error for a failed save to the API due to a virus', done => {
    ;(uploadRecallDocument as jest.Mock).mockRejectedValue({
      data: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    req.files = [
      {
        originalname: 'licence.pdf',
        buffer: 'abc',
        mimetype: 'application/pdf',
      },
    ]
    res.json = () => {
      expect(req.session.errors).toEqual([
        {
          href: '#documents',
          name: 'documents',
          text: 'licence.pdf contains a virus',
        },
      ])
      done()
    }
    uploadMultipleNewDocuments(req, res)
  })

  it('forces all uploads to be uncategorised', async () => {
    req.files = [
      {
        originalname: 'PreCons Wesley Holt.pdf',
        buffer: 'def',
        mimetype: 'application/pdf',
      },
    ]
    req.body.categoryName = 'PREVIOUS_CONVICTIONS_SHEET'
    res.render = jest.fn()
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [],
    })
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    await uploadMultipleNewDocuments(req, res)
    expect(uploadRecallDocument).toHaveBeenCalledWith(
      '789',
      { category: 'UNCATEGORISED', fileContent: 'def', fileName: 'PreCons Wesley Holt.pdf' },
      'token'
    )
  })

  it('creates errors for files with either invalid file extensions or MIME types', done => {
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    req.files = [
      {
        originalname: 'licence.doc',
        buffer: 'abc',
        mimetype: 'application/pdf',
      },
      {
        originalname: 'report.pdf',
        buffer: 'def',
        mimetype: 'application/msword',
      },
    ]
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [],
    })
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    res.json = () => {
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
    }
    uploadMultipleNewDocuments(req, res)
  })
})
