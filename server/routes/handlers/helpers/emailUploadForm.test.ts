// @ts-nocheck
import { emailUploadForm } from './emailUploadForm'
import { addRecallDocument, updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { mockPostRequest } from '../../testutils/mockRequestUtils'
import { uploadStorageField } from './uploadStorage'
import { validateRecallRequestReceived } from '../book/helpers/validateRecallRequestReceived'
import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('./uploadStorage')

const handler = emailUploadForm({
  emailFieldName: 'recallRequestEmailFileName',
  validator: validateRecallRequestReceived,
  documentCategory: ApiRecallDocument.category.RECALL_REQUEST_EMAIL,
  nextPageUrlSuffix: 'last-release',
})

describe('emailUploadForm', () => {
  let req
  beforeEach(() => {
    req = mockPostRequest({
      params: { nomsNumber: '456', recallId: '789' },
      body: {
        recallEmailReceivedDateTimeYear: '2021',
        recallEmailReceivedDateTimeMonth: '5',
        recallEmailReceivedDateTimeDay: '20',
        recallEmailReceivedDateTimeHour: '0',
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
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    const res = {
      locals: { user: {} },
      redirect: (httpStatus, path) => {
        expect(addRecallDocument).toHaveBeenCalledTimes(1)
        expect(updateRecall).toHaveBeenCalledTimes(1)
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/persons/456/recalls/789/last-release')
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
    ;(addRecallDocument as jest.Mock).mockRejectedValue(new Error('test'))
    const res = {
      locals: { user: {} },
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

  it("doesn't save the email to the API if the file extension is invalid", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.pdf',
        buffer: 'def',
      }
      cb()
    })
    const res = {
      locals: { user: {} },
      redirect: () => {
        expect(addRecallDocument).not.toHaveBeenCalled()
        expect(updateRecall).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#recallRequestEmailFileName',
            name: 'recallRequestEmailFileName',
            text: 'The selected file must be an .msg or .eml',
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
      locals: { user: { token: 'TOKEN' } },
      redirect: () => {
        expect(addRecallDocument).not.toHaveBeenCalled()
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
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    const res = {
      locals: { user: {} },
      redirect: () => {
        expect(addRecallDocument).toHaveBeenCalledTimes(1)
        expect(updateRecall).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#recallEmailReceivedDateTime',
            name: 'recallEmailReceivedDateTime',
            text: 'The date and time you received the email must include: year',
            values: {
              year: '',
              month: '5',
              day: '20',
              hour: '0',
              minute: '30',
            },
          },
        ])
        done()
      },
    }
    handler(req, res)
  })
})
