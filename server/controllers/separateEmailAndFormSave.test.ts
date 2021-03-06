// @ts-nocheck
import { separateEmailAndFormSave } from './separateEmailAndFormSave'
import { uploadRecallDocument, updateRecall } from '../clients/manageRecallsApiClient'
import { mockReq, mockRes } from './testUtils/mockRequestUtils'
import { uploadStorageField } from './documents/upload/helpers/uploadStorage'
import * as processUploadExports from './documents/upload/helpers/processUpload'
import { validateRecallRequestReceived } from './book/validators/validateRecallRequestReceived'
import { RecallDocument } from '../@types/manage-recalls-api/models/RecallDocument'
import { validateRecallNotificationEmail } from './assess/validators/validateRecallNotificationEmail'
import { UploadDocumentRequest } from '../@types/manage-recalls-api/models/UploadDocumentRequest'
import getRecallResponse from '../../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { validateNsyEmail } from './dossier/validators/validateNsyEmail'

jest.mock('../clients/manageRecallsApiClient')
jest.mock('./documents/upload/helpers/uploadStorage')

const handler = separateEmailAndFormSave({
  uploadFormFieldName: 'recallRequestEmailFileName',
  validator: validateRecallRequestReceived,
  documentCategory: RecallDocument.category.RECALL_REQUEST_EMAIL,
})

describe('separateEmailAndFormSave', () => {
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

  it('sends the uploaded email to the API, updates the recall then redirects', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { basePath: '/recalls/789/' },
      },
      redirect: (httpStatus, path) => {
        expect(uploadRecallDocument).toHaveBeenCalledTimes(1)
        expect(updateRecall).toHaveBeenCalledTimes(1)
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/recalls/789/last-release')
        done()
      },
    }
    handler(req, res)
  })

  it('redirects to the fromPage if supplied eg check answers', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
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
    handler(req, res)
  })

  it("doesn't update the recall if there are no recall properties to save (only the uploaded email)", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })
    req.body = {
      confirmNsyEmailSent: 'YES',
    }
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { basePath: '/recalls/789/' },
      },
      redirect: (httpStatus, path) => {
        expect(uploadRecallDocument).toHaveBeenCalledTimes(1)
        expect(updateRecall).not.toHaveBeenCalled()
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/recalls/789/dossier-letter')
        done()
      },
    }
    separateEmailAndFormSave({
      uploadFormFieldName: 'recallNsyEmailFileName',
      validator: validateNsyEmail,
      documentCategory: RecallDocument.category.NSY_REMOVE_WARRANT_EMAIL,
    })(req, res)
  })

  it("creates an error, doesn't update the recall, and reloads the page if the document save fails", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })
    ;(uploadRecallDocument as jest.Mock).mockRejectedValue(new Error('test'))
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/recalls/789/' } },
      redirect: (httpStatus, path) => {
        expect(updateRecall).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#recallRequestEmailFileName',
            name: 'recallRequestEmailFileName',
            text: 'email.msg could not be uploaded - try again',
          },
        ])
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/upload-page')
        done()
      },
    }
    handler(req, res)
  })

  it("creates an error, doesn't update the recall and reloads the page if the upload from the browser to the app fails", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      cb(req, res, new Error('Upload failed'))
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/recalls/789/' } },
      redirect: (httpStatus, path) => {
        expect(updateRecall).not.toHaveBeenCalled()
        expect(uploadRecallDocument).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#recallRequestEmailFileName',
            name: 'recallRequestEmailFileName',
            text: 'The selected file could not be uploaded ??? try again',
          },
        ])
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/upload-page')
        done()
      },
    }
    handler(req, res)
  })

  it('creates an error and reloads the page if the email has a virus', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })
    ;(uploadRecallDocument as jest.Mock).mockRejectedValue({
      data: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/recalls/789/' } },
      redirect: (httpStatus, path) => {
        expect(updateRecall).not.toHaveBeenCalled()
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
    handler(req, res)
  })

  it("doesn't save the email to the API and reloads the page if the file extension is invalid", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.pdf',
        buffer: 'def',
        mimetype: 'application/pdf',
      }
      cb()
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/recalls/789/' } },
      redirect: (httpStatus, path) => {
        expect(uploadRecallDocument).not.toHaveBeenCalled()
        expect(updateRecall).not.toHaveBeenCalled()
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
    handler(req, res)
  })

  it("doesn't try to save to the API if a new email has not been uploaded but one has previously", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.body.RECALL_REQUEST_EMAIL = 'existingUpload'
      cb()
    })
    const res = {
      locals: { user: { token: 'TOKEN' }, urlInfo: { basePath: '/recalls/789/' } },
      redirect: (httpStatus, path) => {
        expect(uploadRecallDocument).not.toHaveBeenCalled()
        expect(updateRecall).toHaveBeenCalledWith(
          '789',
          { recallEmailReceivedDateTime: '2021-05-19T23:30:00.000Z' },
          'TOKEN'
        )
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/recalls/789/last-release')
        done()
      },
    }
    handler(req, res)
  })

  it("saves the email to the API if it's valid, even if there are validation errors for other form fields, and reloads the page", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })
    req.body.recallEmailReceivedDateTimeYear = ''
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/recalls/789/' } },
      redirect: (httpStatus, path) => {
        expect(uploadRecallDocument).toHaveBeenCalledTimes(1)
        expect(updateRecall).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#recallEmailReceivedDateTime-recallEmailReceivedDateTimeDay',
            name: 'recallEmailReceivedDateTime',
            text: 'The date and time you received the recall email must include a year',
            values: {
              year: '',
              month: '05',
              day: '20',
              hour: '00',
              minute: '30',
            },
          },
        ])
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/upload-page')
        done()
      },
    }
    handler(req, res)
  })

  it('calls a saveToApiFn function if passed', done => {
    const saveToApiFn = jest.fn()
    const handlerWithSaveFn = separateEmailAndFormSave({
      uploadFormFieldName: 'recallNotificationEmailFileName',
      validator: validateRecallNotificationEmail,
      saveToApiFn,
      documentCategory: UploadDocumentRequest.category.RECALL_NOTIFICATION_EMAIL,
    })
    req.body = {
      confirmRecallNotificationEmailSent: 'YES',
      recallNotificationEmailSentDateTimeYear: '2021',
      recallNotificationEmailSentDateTimeMonth: '09',
      recallNotificationEmailSentDateTimeDay: '04',
      recallNotificationEmailSentDateTimeHour: '14',
      recallNotificationEmailSentDateTimeMinute: '47',
    }
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = validFile
      cb()
    })
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(updateRecall as jest.Mock).mockResolvedValue({ ...getRecallResponse, inCustodyAtAssessment: true })
    const res = {
      locals: { user: { uuid: '000' }, urlInfo: { basePath: '/recalls/789/' } },
      redirect: (httpStatus, path) => {
        expect(saveToApiFn).toHaveBeenCalledWith({
          recallId: '789',
          user: { uuid: '000' },
          valuesToSave: {
            assessedByUserId: '000',
            recallNotificationEmailSentDateTime: '2021-09-04T13:47:00.000Z',
          },
        })
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/recalls/789/assess-confirmation')
        done()
      },
    }
    handlerWithSaveFn(req, res)
  })

  it('calls error middleware if an error is thrown', async () => {
    const err = new Error('test')
    jest.spyOn(processUploadExports, 'processUpload').mockRejectedValue(err)
    const res = mockRes()
    const next = jest.fn()
    await handler(req, res, next)
    expect(next).toHaveBeenCalledWith(err)
  })
})
