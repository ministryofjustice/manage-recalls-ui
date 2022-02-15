// @ts-nocheck
import { addRescindRecord, updateRescindRecord } from '../../../clients/manageRecallsApiClient'
import { mockPostRequest } from '../../testutils/mockRequestUtils'
import { uploadStorageField } from '../documents/upload/helpers/uploadStorage'
import { rescindFormHandler } from './rescindFormHandler'

jest.mock('../../../clients/manageRecallsApiClient')
jest.mock('../documents/upload/helpers/uploadStorage')

describe('rescindFormHandler - add', () => {
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
    ;(addRescindRecord as jest.Mock).mockResolvedValue({
      status: 201,
    })
    const res = {
      locals: {
        user: { token: 'token' },
        urlInfo: { basePath: '/persons/456/recalls/789/', fromPage: 'view-recall' },
      },
      redirect: jest.fn(),
    }
    await rescindFormHandler({ action: 'add' })(req, res)
    expect(addRescindRecord.mock.calls[0][1]).toEqual({
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
    ;(addRescindRecord as jest.Mock).mockResolvedValue({
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
    rescindFormHandler({ action: 'add' })(req, res)
  })

  it('creates an error if the email has a virus', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'report.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(addRescindRecord as jest.Mock).mockRejectedValue({
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
    rescindFormHandler({ action: 'add' })(req, res)
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
        expect(addRescindRecord).not.toHaveBeenCalled()
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
    rescindFormHandler({ action: 'add' })(req, res)
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
        expect(addRescindRecord).not.toHaveBeenCalled()
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
    rescindFormHandler({ action: 'add' })(req, res)
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
        expect(addRescindRecord).not.toHaveBeenCalled()
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
    rescindFormHandler({ action: 'add' })(req, res)
  })
})

describe('rescindFormHandler - update', () => {
  let req
  beforeEach(() => {
    req = mockPostRequest({
      params: { nomsNumber: '456', recallId: '789' },
      body: {
        approveRescindDecision: 'YES',
        confirmEmailSent: 'YES',
        rescindDecisionDetail: 'Chased by email',
        rescindDecisionEmailSentDateDay: '10',
        rescindDecisionEmailSentDateMonth: '05',
        rescindDecisionEmailSentDateYear: '2021',
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
    ;(updateRescindRecord as jest.Mock).mockResolvedValue({
      status: 200,
    })
    const res = {
      locals: {
        user: { token: 'token' },
        urlInfo: { basePath: '/persons/456/recalls/789/', fromPage: 'view-recall' },
      },
      redirect: jest.fn(),
    }
    await rescindFormHandler({ action: 'update' })(req, res)
    expect(updateRescindRecord.mock.calls[0][2]).toEqual({
      approved: true,
      emailSentDate: '2021-05-10',
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
    ;(updateRescindRecord as jest.Mock).mockResolvedValue({
      status: 200,
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
    rescindFormHandler({ action: 'update' })(req, res)
  })

  it('creates an error if the email has a virus', done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'report.msg',
        buffer: 'def',
      }
      cb()
    })
    ;(updateRescindRecord as jest.Mock).mockRejectedValue({
      data: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(req.session.errors).toEqual([
          {
            href: '#rescindDecisionEmailFileName',
            name: 'rescindDecisionEmailFileName',
            text: 'report.msg contains a virus',
          },
        ])
        done()
      },
    }
    rescindFormHandler({ action: 'update' })(req, res)
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
        expect(updateRescindRecord).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#rescindDecisionEmailFileName',
            name: 'rescindDecisionEmailFileName',
            text: 'The selected file must be an MSG or EML',
          },
        ])
        done()
      },
    }
    rescindFormHandler({ action: 'update' })(req, res)
  })

  it("doesn't save to the API if the detail is missing", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      req.body.rescindDecisionDetail = ''
      cb()
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(updateRescindRecord).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#rescindDecisionDetail',
            name: 'rescindDecisionDetail',
            text: 'Provide more detail',
          },
        ])
        done()
      },
    }
    rescindFormHandler({ action: 'update' })(req, res)
  })

  it("doesn't save to the API if the date is missing", done => {
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'email.msg',
        buffer: 'def',
      }
      req.body.rescindDecisionEmailSentDateDay = ''
      req.body.rescindDecisionEmailSentDateMonth = ''
      req.body.rescindDecisionEmailSentDateYear = ''
      cb()
    })
    const res = {
      locals: { user: {}, urlInfo: { basePath: '/persons/456/recalls/789/' } },
      redirect: () => {
        expect(updateRescindRecord).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#rescindDecisionEmailSentDate',
            name: 'rescindDecisionEmailSentDate',
            text: 'Enter the date you sent the rescind decision email',
            values: { day: '', month: '', year: '' },
          },
        ])
        done()
      },
    }
    rescindFormHandler({ action: 'update' })(req, res)
  })
})
