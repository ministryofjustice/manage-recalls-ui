// @ts-nocheck
import { uploadEmailFormHandler } from './uploadEmailFormHandler'
import { uploadRecallDocument, unassignUserFromRecall, updateRecall } from '../../../../clients/manageRecallsApiClient'
import { mockPostRequest } from '../../../testutils/mockRequestUtils'
import { uploadStorageField } from './helpers/uploadStorage'
import { validateRecallRequestReceived } from '../../book/helpers/validateRecallRequestReceived'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { validateRecallNotificationEmail } from '../../assess/helpers/validateRecallNotificationEmail'
import { UploadDocumentRequest } from '../../../../@types/manage-recalls-api/models/UploadDocumentRequest'

jest.mock('../../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('./helpers/uploadStorage')

const handler = uploadEmailFormHandler({
  emailFieldName: 'recallRequestEmailFileName',
  validator: validateRecallRequestReceived,
  documentCategory: RecallDocument.category.RECALL_REQUEST_EMAIL,
  nextPageUrlSuffix: 'last-release',
})

describe('emailUploadForm', () => {
  let req
  beforeEach(() => {
    req = mockPostRequest({
      params: { nomsNumber: '456', recallId: '789' },
      body: {
        recallEmailReceivedDateTimeYear: '2021',
        recallEmailReceivedDateTimeMonth: '05',
        recallEmailReceivedDateTimeDay: '20',
        recallEmailReceivedDateTimeHour: '00',
        recallEmailReceivedDateTimeMinute: '30',
      },
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('sends the uploaded email to the API, updates the recall then redirects', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { basePath: '/persons/456/recalls/789/' },
      },
      redirect: (httpStatus, path) => {
        expect(uploadRecallDocument).toHaveBeenCalledTimes(1)
        expect(updateRecall).toHaveBeenCalledTimes(1)
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/persons/456/recalls/789/last-release')
        done()
      },
    }
    handler(req, res)
  })

  it('redirects to the fromPage if supplied eg check answers', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { fromPage: 'check-answers', basePath: '/persons/456/recalls/789/' },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/persons/456/recalls/789/check-answers')
        done()
      },
    }
    handler(req, res)
  })

  it("doesn't update the recall if the document save fails", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'report.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(uploadRecallDocument as jest.Mock).mockRejectedValue(new Error('test'))
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(updateRecall).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#recallRequestEmailFileName',
            name: 'recallRequestEmailFileName',
            text: 'The selected file could not be uploaded – try again',
          },
        ])
        done()
      },
    }
    handler(req, res)
  })

  it('creates an error if the email has a virus', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'report.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(uploadRecallDocument as jest.Mock).mockRejectedValue({
      data: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(updateRecall).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#recallRequestEmailFileName',
            name: 'recallRequestEmailFileName',
            text: 'report.msg contains a virus',
          },
        ])
        done()
      },
    }
    handler(req, res)
  })

  it("doesn't save the email to the API if the file extension is invalid", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.pdf',
        buffer: 'def',
      }
      cb()
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(uploadRecallDocument).not.toHaveBeenCalled()
        expect(updateRecall).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#recallRequestEmailFileName',
            name: 'recallRequestEmailFileName',
            text: 'The selected file must be an MSG or EML',
          },
        ])
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
      locals: { user: { token: 'TOKEN' }, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(uploadRecallDocument).not.toHaveBeenCalled()
        expect(updateRecall).toHaveBeenCalledWith(
          '789',
          { recallEmailReceivedDateTime: '2021-05-19T23:30:00.000Z' },
          'TOKEN'
        )
        expect(req.session.errors).toBeUndefined()
        done()
      },
    }
    handler(req, res)
  })

  it("saves the email to the API if it's valid but there are validation errors for the date", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      cb()
    })
    req.body.recallEmailReceivedDateTimeYear = ''
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(uploadRecallDocument).toHaveBeenCalledTimes(1)
        expect(updateRecall).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#recallEmailReceivedDateTime',
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
        done()
      },
    }
    handler(req, res)
  })

  it('unassigns the user from the recall', done => {
    const handlerWithUnassign = uploadEmailFormHandler({
      emailFieldName: 'recallNotificationEmailFileName',
      validator: validateRecallNotificationEmail,
      unassignUserFromRecall,
      documentCategory: UploadDocumentRequest.category.RECALL_NOTIFICATION_EMAIL,
      nextPageUrlSuffix: 'assess-confirmation',
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
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(unassignUserFromRecall as jest.Mock).mockResolvedValue({
      recallId: '789',
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(unassignUserFromRecall).toHaveBeenCalledTimes(1)
        done()
      },
    }
    handlerWithUnassign(req, res)
  })

  it('redirects even if the user unassignment fails', done => {
    const handlerWithUnassign = uploadEmailFormHandler({
      emailFieldName: 'recallNotificationEmailFileName',
      validator: validateRecallNotificationEmail,
      unassignUserFromRecall,
      documentCategory: UploadDocumentRequest.category.RECALL_NOTIFICATION_EMAIL,
      nextPageUrlSuffix: 'assess-confirmation',
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
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(uploadRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(unassignUserFromRecall as jest.Mock).mockRejectedValue(new Error('test'))
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: (httpStatus, path) => {
        expect(path).toEqual('/persons/456/recalls/789/assess-confirmation')
        done()
      },
    }
    handlerWithUnassign(req, res)
  })
})
