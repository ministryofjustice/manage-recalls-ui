// @ts-nocheck
import { addRescindRequestRecord } from '../../../clients/manageRecallsApiClient'
import { mockPostRequest } from '../../testutils/mockRequestUtils'
import { uploadStorageField } from '../documents/upload/helpers/uploadStorage'
import { addRescindRequestFormHandler } from './addRescindRequestFormHandler'

jest.mock('../../../clients/manageRecallsApiClient')
jest.mock('../documents/upload/helpers/uploadStorage')

describe('addRescindRequestFormHandler', () => {
  let req
  beforeEach(() => {
    req = mockPostRequest({
      params: { nomsNumber: '456', recallId: '789' },
      body: {
        rescindRequestDetail: 'Chased by email',
        rescindRequestEmailReceivedDateDay: '10',
        rescindRequestEmailReceivedDateMonth: '05',
        rescindRequestEmailReceivedDateYear: '2021',
      },
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('saves the uploaded email, date and detail to the API', async () => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(addRescindRequestRecord as jest.Mock).mockResolvedValue({
      status: 201,
    })
    const res = {
      locals: {
        user: { token: 'token' },
        urlInfo: { basePath: '/persons/456/recalls/789/', fromPage: 'view-recall' },
      },
      redirect: jest.fn(),
    }
    await addRescindRequestFormHandler(req, res)
    expect(addRescindRequestRecord.mock.calls[0][1]).toEqual({
      emailReceivedDate: '2021-05-10',
      details: 'Chased by email',
      emailFileContent: 'def',
      emailFileName: 'email.msg',
    })
  })

  it('returns no errors and redirects', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(addRescindRequestRecord as jest.Mock).mockResolvedValue({
      status: 201,
    })
    const res = {
      locals: {
        user: {},
        urlInfo: { basePath: '/persons/456/recalls/789/', fromPage: 'view-recall' },
      },
      redirect: (httpStatus, path) => {
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/persons/456/recalls/789/view-recall')
        done()
      },
    }
    addRescindRequestFormHandler(req, res)
  })

  it('creates an error if the email has a virus', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'report.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(addRescindRequestRecord as jest.Mock).mockRejectedValue({
      data: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(req.session.errors).toEqual([
          {
            href: '#rescindRequestEmailFileName',
            name: 'rescindRequestEmailFileName',
            text: 'report.msg contains a virus',
          },
        ])
        done()
      },
    }
    addRescindRequestFormHandler(req, res)
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
        expect(addRescindRequestRecord).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#rescindRequestEmailFileName',
            name: 'rescindRequestEmailFileName',
            text: 'The selected file must be an MSG or EML',
          },
        ])
        done()
      },
    }
    addRescindRequestFormHandler(req, res)
  })

  it("doesn't save to the API if the detail is missing", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      req.body.rescindRequestDetail = ''
      cb()
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(addRescindRequestRecord).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#rescindRequestDetail',
            name: 'rescindRequestDetail',
            text: 'Provide more detail',
          },
        ])
        done()
      },
    }
    addRescindRequestFormHandler(req, res)
  })

  it("doesn't save to the API if the date is missing", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      req.body.rescindRequestEmailReceivedDateDay = ''
      req.body.rescindRequestEmailReceivedDateMonth = ''
      req.body.rescindRequestEmailReceivedDateYear = ''
      cb()
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(addRescindRequestRecord).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#rescindRequestEmailReceivedDate',
            name: 'rescindRequestEmailReceivedDate',
            text: 'Enter the date you received the rescind request email',
            values: { day: '', month: '', year: '' },
          },
        ])
        done()
      },
    }
    addRescindRequestFormHandler(req, res)
  })
})
