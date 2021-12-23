// @ts-nocheck
import { addMissingDocumentRecord, getRecall } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { mockPostRequest } from '../../../testutils/mockRequestUtils'
import { uploadStorageField } from '../upload/helpers/uploadStorage'
import { addMissingDocumentRecordFormHandler } from './addMissingDocumentRecordFormHandler'
import getRecallResponse from '../../../../../fake-manage-recalls-api/stubs/__files/get-recall.json'

jest.mock('../../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../upload/helpers/uploadStorage')

describe('addMissingDocumentRecordForm', () => {
  let req
  beforeEach(() => {
    req = mockPostRequest({
      params: { nomsNumber: '456', recallId: '789' },
      body: {
        missingDocumentsDetail: 'Chased by email',
      },
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('saves the uploaded email and detail to the API then redirects', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue(getRecallResponse)
    ;(addMissingDocumentRecord as jest.Mock).mockResolvedValue({
      status: 201,
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { basePath: '/persons/456/recalls/789/' },
      },
      redirect: (httpStatus, path) => {
        expect(addMissingDocumentRecord).toHaveBeenCalledTimes(1)
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/persons/456/recalls/789/check-answers')
        done()
      },
    }
    addMissingDocumentRecordFormHandler(req, res)
  })

  it('saves a list of missing document categories to the API', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
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
    ;(addMissingDocumentRecord as jest.Mock).mockResolvedValue({
      status: 201,
    })
    const res = {
      locals: {
        user: { token: 'token' },
        urlInfo: { basePath: '/persons/456/recalls/789/' },
      },
      redirect: () => {
        expect(addMissingDocumentRecord.mock.calls[0][0].categories).toEqual([
          'PART_A_RECALL_REPORT',
          'LICENCE',
          'OASYS_RISK_ASSESSMENT',
        ])
        done()
      },
    }
    addMissingDocumentRecordFormHandler(req, res)
  })

  it('redirects to the fromPage if supplied eg assess recall', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue(getRecallResponse)
    ;(addMissingDocumentRecord as jest.Mock).mockResolvedValue({
      status: 201,
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { fromPage: 'assess-recall', basePath: '/persons/456/recalls/789/' },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/persons/456/recalls/789/assess-recall')
        done()
      },
    }
    addMissingDocumentRecordFormHandler(req, res)
  })

  it('creates an error if the email has a virus', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'report.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(getRecall as jest.Mock).mockResolvedValue(getRecallResponse)
    ;(addMissingDocumentRecord as jest.Mock).mockRejectedValue({
      data: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(req.session.errors).toEqual([
          {
            href: '#missingDocumentsEmailFileName',
            name: 'missingDocumentsEmailFileName',
            text: 'report.msg contains a virus',
          },
        ])
        done()
      },
    }
    addMissingDocumentRecordFormHandler(req, res)
  })

  it("doesn't save to the API if the file extension is invalid", done => {
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
        expect(addMissingDocumentRecord).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#missingDocumentsEmailFileName',
            name: 'missingDocumentsEmailFileName',
            text: 'The selected file must be an MSG or EML',
          },
        ])
        done()
      },
    }
    addMissingDocumentRecordFormHandler(req, res)
  })

  it("doesn't save to the API if the detail is missing", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      req.body.missingDocumentsDetail = ''
      cb()
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(addMissingDocumentRecord).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#missingDocumentsDetail',
            name: 'missingDocumentsDetail',
            text: 'Provide more detail',
          },
        ])
        done()
      },
    }
    addMissingDocumentRecordFormHandler(req, res)
  })
})
