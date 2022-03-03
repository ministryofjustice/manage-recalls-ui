// @ts-nocheck
import { addNote, getRecall } from '../../clients/manageRecallsApiClient'
import { mockPostRequest } from '../testUtils/mockRequestUtils'
import { uploadStorageField } from '../documents/upload/helpers/uploadStorage'
import { addNoteHandler } from './addNoteHandler'
import getRecallResponse from '../../../fake-manage-recalls-api/stubs/__files/get-recall.json'

jest.mock('../../clients/manageRecallsApiClient')
jest.mock('../documents/upload/helpers/uploadStorage')

describe('addNoteForm', () => {
  let req
  beforeEach(() => {
    req = mockPostRequest({
      params: { nomsNumber: '456', recallId: '789' },
      body: {
        subject: 'subject text',
        details: 'details text',
      },
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('with no uploaded document saves subject and details to the API then redirects', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = undefined
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue(getRecallResponse)
    ;(addNote as jest.Mock).mockResolvedValue({
      status: 201,
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { basePath: '/persons/456/recalls/789/' },
      },
      redirect: (httpStatus, path) => {
        expect(addNote).toHaveBeenCalledTimes(1)
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/persons/456/recalls/789/check-answers')
        done()
      },
    }
    addNoteHandler(req, res)
  })

  it('with uploaded document saves subject and details to the API then redirects', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'document.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue(getRecallResponse)
    ;(addNote as jest.Mock).mockResolvedValue({
      status: 201,
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { basePath: '/persons/456/recalls/789/' },
      },
      redirect: (httpStatus, path) => {
        expect(addNote).toHaveBeenCalledTimes(1)
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/persons/456/recalls/789/check-answers')
        done()
      },
    }
    addNoteHandler(req, res)
    expect(addNote.mock.calls[0][1]).toEqual({
      subject: 'subject text',
      details: 'details text',
      fileName: 'document.msg',
      fileContent: 'def',
    })
  })

  it('sets a confirmation message', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(addNote as jest.Mock).mockResolvedValue({
      status: 201,
    })
    const res = {
      locals: {
        user: { token: 'token' },
        urlInfo: { basePath: '/persons/456/recalls/789/', fromPage: 'view-recall' },
      },
      redirect: () => {
        expect(req.session.confirmationMessage).toEqual({
          link: {
            href: '#notes',
            text: 'View',
          },
          text: 'Note added.',
          type: 'success',
        })
        done()
      },
    }
    addNoteHandler(req, res)
  })

  it('redirects to the fromPage if supplied e.g. assess-recall', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'document.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue(getRecallResponse)
    ;(addNote as jest.Mock).mockResolvedValue({
      status: 201,
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { fromPage: 'assess-recall', basePath: '/persons/456/recalls/789/', fromHash: 'add-note' },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/persons/456/recalls/789/assess-recall#add-note')
        done()
      },
    }
    addNoteHandler(req, res)
  })

  it('creates an error if the document has a virus', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'file.doc',
        buffer: 'def',
      }
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue(getRecallResponse)
    ;(addNote as jest.Mock).mockRejectedValue({
      data: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(req.session.errors).toEqual([
          {
            href: '#fileName',
            name: 'fileName',
            text: 'file.doc contains a virus',
          },
        ])
        done()
      },
    }
    addNoteHandler(req, res)
  })

  it("doesn't save to the API if the detail is missing", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'document.msg',
        buffer: 'def',
      }
      req.body.details = ''
      cb()
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(addNote).not.toHaveBeenCalled()
        expect(req.session.unsavedValues).toEqual(req.body)
        expect(req.session.errors).toEqual([
          {
            href: '#details',
            name: 'details',
            text: 'Provide more detail',
          },
        ])
        done()
      },
    }
    addNoteHandler(req, res)
  })
})
