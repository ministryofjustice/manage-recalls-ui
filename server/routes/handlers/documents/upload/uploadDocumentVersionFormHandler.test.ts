// @ts-nocheck
import { uploadDocumentVersionFormHandler } from './uploadDocumentVersionFormHandler'
import { uploadRecallDocument } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { uploadStorageField } from './helpers/uploadStorage'

jest.mock('../../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('./helpers/uploadStorage')

describe('uploadDocumentVersionFormHandler', () => {
  const req = {
    params: {
      recallId: '123',
    },
    session: {},
    body: {
      categoryName: 'LICENCE',
      details: 'Random details',
    },
  }
  const res = {
    locals: { user: {}, urlInfo: {} },
  }

  afterEach(() => jest.resetAllMocks())

  it('creates errors for a failed save to the API', done => {
    ;(uploadRecallDocument as jest.Mock).mockRejectedValue({ data: 'Error' })
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'licence.pdf',
        buffer: 'abc',
        mimetype: 'application/pdf',
      }
      cb()
    })
    res.redirect = () => {
      expect(req.session.errors).toEqual([
        {
          href: '#document',
          name: 'document',
          text: 'licence.pdf could not be uploaded - try again',
        },
      ])
      done()
    }
    uploadDocumentVersionFormHandler(req, res)
  })

  it('creates an error for a failed save to the API due to a virus', done => {
    ;(uploadRecallDocument as jest.Mock).mockRejectedValue({
      data: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = [
        {
          originalname: 'licence.pdf',
          buffer: 'abc',
          mimetype: 'application/pdf',
        },
      ]
      cb()
    })
    res.redirect = () => {
      expect(req.session.errors).toEqual([
        {
          href: '#document',
          name: 'document',
          text: 'licence.pdf contains a virus',
        },
      ])
      done()
    }
    uploadDocumentVersionFormHandler(req, res)
  })

  it('creates an error for a file with either an invalid file extension or MIME type', done => {
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'licence.doc',
        buffer: 'abc',
        mimetype: 'application/msword',
      }
      cb()
    })
    res.redirect = () => {
      expect(uploadRecallDocument).not.toHaveBeenCalled()
      expect(req.session.errors).toEqual([
        {
          href: '#document',
          name: 'document',
          text: "The selected file 'licence.doc' must be a PDF",
        },
      ])
      done()
    }
    uploadDocumentVersionFormHandler(req, res)
  })

  it('creates an error if no file is uploaded', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = undefined
      cb()
    })
    res.redirect = () => {
      expect(uploadRecallDocument).not.toHaveBeenCalled()
      expect(req.session.errors).toEqual([
        {
          href: '#document',
          name: 'document',
          text: 'Select a file',
        },
      ])
      done()
    }
    uploadDocumentVersionFormHandler(req, res)
  })
})
