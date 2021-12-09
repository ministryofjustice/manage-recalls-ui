// @ts-nocheck
import { uploadStorageArray } from './helpers/uploadStorage'
import { deleteDocument } from '../delete/deleteDocument'
import { uploadDocumentsFormHandler } from './uploadDocumentsFormHandler'
import { uploadMultipleNewDocuments } from './helpers/uploadMultipleNewDocuments'
import { categoriseFiles } from '../categorise/categoriseFiles'

jest.mock('./helpers/uploadStorage')
jest.mock('../delete/deleteDocument')
jest.mock('./helpers/uploadMultipleNewDocuments')
jest.mock('../categorise/categoriseFiles')

describe('uploadRecallDocumentsFormHandler', () => {
  const req = {
    originalUrl: '/path',
    session: {},
  }
  const res = {}

  beforeEach(() => {
    req.body = {}
    ;(uploadStorageArray as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = []
      cb()
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('calls deleteDocument if the delete button was pressed', async () => {
    req.body.delete = 'delete'
    await uploadDocumentsFormHandler(req, res)
    expect(deleteDocument).toHaveBeenCalledWith(req, res)
  })

  it('calls uploadMultipleNewDocuments if the upload button was pressed', async () => {
    req.body.upload = 'upload'
    await uploadDocumentsFormHandler(req, res)
    expect(uploadMultipleNewDocuments).toHaveBeenCalledWith(req, res)
  })

  it('calls categoriseFiles if the upload button was pressed', async () => {
    req.body.continue = 'continue'
    await uploadDocumentsFormHandler(req, res)
    expect(categoriseFiles).toHaveBeenCalledWith(req, res)
  })

  it('reloads the page if an error is thrown', done => {
    req.body.upload = 'upload'
    ;(uploadMultipleNewDocuments as jest.Mock).mockRejectedValue(new Error('error'))
    res.redirect = (status, path) => {
      expect(path).toEqual(req.originalUrl)
      done()
    }
    uploadDocumentsFormHandler(req, res)
  })
})
