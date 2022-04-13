// @ts-nocheck
import { combinedDocumentAndFormSave } from './combinedDocumentAndFormSave'
import { mockReq, mockRes } from './testUtils/mockRequestUtils'
import { uploadStorageField } from './documents/upload/helpers/uploadStorage'
import { validateRecallRequestReceived } from './book/validators/validateRecallRequestReceived'
import { validateAddNote } from './note/validators/validateAddNote'

jest.mock('./documents/upload/helpers/uploadStorage')

describe('combinedDocumentAndFormSave', () => {
  let req
  const validFile = {
    originalname: 'email.msg',
    mimetype: 'application/octet-stream',
    buffer: 'def',
  }

  beforeEach(() => {
    req = mockReq({
      method: 'POST',
      params: { nomsNumber: '456', recallId: '789' },
      body: {
        recallEmailReceivedDateTimeYear: '2021',
        recallEmailReceivedDateTimeMonth: '05',
        recallEmailReceivedDateTimeDay: '20',
        recallEmailReceivedDateTimeHour: '00',
        recallEmailReceivedDateTimeMinute: '30',
      },
      originalUrl: '/upload-page',
    })
  })

  it('calls the supplied save function, then redirects', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })
    const saveToApiFn = jest.fn()
    saveToApiFn.mockResolvedValue({
      status: 200,
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { basePath: '/recalls/789/' },
      },
      redirect: (httpStatus, path) => {
        expect(saveToApiFn).toHaveBeenCalledTimes(1)
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/recalls/789/last-release')
        done()
      },
    }
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'recallRequestEmailFileName',
      validator: validateRecallRequestReceived,
      saveToApiFn,
    })(req, res)
  })

  it('sets a confirmation message if successful', done => {
    req.body = {
      subject: 'Subject',
      details: 'Details...',
    }
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })
    const saveToApiFn = jest.fn()
    saveToApiFn.mockResolvedValue({
      status: 200,
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { basePath: '/recalls/789/' },
      },
      redirect: (httpStatus, path) => {
        expect(saveToApiFn).toHaveBeenCalledTimes(1)
        expect(req.session.confirmationMessage).toEqual({
          link: {
            href: '#notes',
            text: 'View',
          },
          text: 'Note added.',
          type: 'success',
        })
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/recalls/789/view-recall')
        done()
      },
    }
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'fileName',
      validator: validateAddNote,
      saveToApiFn,
    })(req, res)
  })

  it('redirects to the fromPage if supplied eg check answers', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })

    const saveToApiFn = jest.fn()
    saveToApiFn.mockResolvedValue({
      status: 200,
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { fromPage: 'check-answers', basePath: '/recalls/789/', fromHash: 'recall-details' },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/recalls/789/check-answers#recall-details')
        done()
      },
    }
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'recallRequestEmailFileName',
      validator: validateRecallRequestReceived,
      saveToApiFn,
    })(req, res)
  })

  it('creates an error and reloads the page if the save fails', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })
    const saveToApiFn = jest.fn()
    saveToApiFn.mockRejectedValue(new Error('test'))
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/recalls/789/' }, env: 'PRODUCTION' },
      redirect: (httpStatus, path) => {
        expect(req.session.errors).toEqual([
          {
            name: 'saveError',
            text: 'An error occurred saving your changes',
          },
        ])
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/upload-page')
        done()
      },
    }
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'recallRequestEmailFileName',
      validator: validateRecallRequestReceived,
      saveToApiFn,
    })(req, res)
  })

  it("stores an error and unsaved values, doesn't call the save function and reloads the page if the upload from the browser to the app fails", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      cb(req, res, new Error('Upload failed'))
    })
    const saveToApiFn = jest.fn()
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/recalls/789/' } },
      redirect: (httpStatus, path) => {
        expect(saveToApiFn).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#recallRequestEmailFileName',
            name: 'recallRequestEmailFileName',
            text: 'The selected file could not be uploaded – try again',
          },
        ])
        expect(req.session.unsavedValues).toEqual({
          recallEmailReceivedDateTimeParts: {
            year: '2021',
            month: '05',
            day: '20',
            hour: '00',
            minute: '30',
          },
        })
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/upload-page')
        done()
      },
    }
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'recallRequestEmailFileName',
      validator: validateRecallRequestReceived,
      saveToApiFn,
    })(req, res)
  })

  it('creates an error and reloads the page if the email has a virus', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })
    const saveToApiFn = jest.fn()
    saveToApiFn.mockRejectedValue({
      data: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/recalls/789/' } },
      redirect: (httpStatus, path) => {
        expect(req.session.errors).toEqual([
          {
            href: '#recallRequestEmailFileName',
            name: 'recallRequestEmailFileName',
            text: 'email.msg contains a virus',
          },
        ])
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/upload-page')
        done()
      },
    }
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'recallRequestEmailFileName',
      validator: validateRecallRequestReceived,
      saveToApiFn,
    })(req, res)
  })

  it("doesn't save the email to the API and reloads the page if the file type is invalid", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.pdf',
        buffer: 'def',
        mimetype: 'application/pdf',
      }
      cb()
    })
    const saveToApiFn = jest.fn()
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/recalls/789/' } },
      redirect: (httpStatus, path) => {
        expect(saveToApiFn).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#recallRequestEmailFileName',
            name: 'recallRequestEmailFileName',
            text: "The selected file 'email.pdf' must be a MSG or EML",
          },
        ])
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/upload-page')
        done()
      },
    }
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'recallRequestEmailFileName',
      validator: validateRecallRequestReceived,
      saveToApiFn,
    })(req, res)
  })

  it('calls error middleware if an error is thrown', async () => {
    const err = new Error('test')
    ;(uploadStorageField as jest.Mock).mockImplementation(() => {
      throw err
    })
    const res = mockRes()
    const next = jest.fn()
    await combinedDocumentAndFormSave({
      uploadFormFieldName: 'recallRequestEmailFileName',
      validator: validateRecallRequestReceived,
      saveToApiFn: jest.fn(),
    })(req, res, next)
    expect(next).toHaveBeenCalledWith(err)
  })
})
