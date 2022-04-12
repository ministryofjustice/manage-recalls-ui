// @ts-nocheck
import { combinedMultipleFilesAndFormSave } from './combinedMultipleFilesAndFormSave'
import { mockReq, mockRes } from './testUtils/mockRequestUtils'
import { uploadStorageFields } from './documents/upload/helpers/uploadStorage'
import { validatePartB } from './partB/validators/validatePartB'
import { sendFileSizeMetric } from './documents/upload/helpers/sendFileSizeMetric'
import * as processUploadExports from './documents/upload/helpers/processUpload'

jest.mock('./documents/upload/helpers/uploadStorage')
jest.mock('./documents/upload/helpers/sendFileSizeMetric')

describe('combinedMultipleFilesAndFormSave', () => {
  let req
  const files = {
    partBFileName: [
      {
        originalname: 'partB.pdf',
        buffer: Buffer.from('def', 'base64'),
        mimetype: 'application/pdf',
      },
    ] as Express.Multer.File[],
    oasysFileName: [
      {
        originalname: 'oasys.pdf',
        buffer: Buffer.from('def', 'base64'),
        mimetype: 'application/pdf',
      },
    ] as Express.Multer.File[],
    emailFileName: [
      {
        originalname: 'email.msg',
        buffer: Buffer.from('def', 'base64'),
        mimetype: 'application/octet-stream',
      },
    ] as Express.Multer.File[],
  }
  let resLocals
  let saveToApiFn: Jest.mock

  beforeEach(() => {
    req = mockReq({
      method: 'POST',
      params: { recallId: '789' },
      body: {
        partBDetails: 'details text',
        partBReceivedDateDay: '05',
        partBReceivedDateMonth: '03',
        partBReceivedDateYear: '2022',
      },
      originalUrl: '/upload-page',
    })
    resLocals = { user: {}, urlInfo: { basePath: '/recalls/789/' }, env: 'PRODUCTION' }
    saveToApiFn = jest.fn()
  })

  afterEach(() => jest.resetAllMocks())

  it('calls the supplied save function, then redirects', done => {
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = files
      cb()
    })
    saveToApiFn.mockResolvedValue({
      status: 200,
    })
    const res = {
      locals: resLocals,
      redirect: (httpStatus, path) => {
        expect(saveToApiFn).toHaveBeenCalledTimes(1)
        expect(req.session.errors).toBeUndefined()
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/recalls/789/support-rerelease')
        done()
      },
    }
    combinedMultipleFilesAndFormSave({
      uploadFormFieldNames: ['partBFileName', 'oasysFileName', 'emailFileName'],
      validator: validatePartB,
      saveToApiFn,
    })(req, res)
  })

  it('sends a metric with the file size', done => {
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = files
      cb()
    })
    saveToApiFn.mockResolvedValue({
      status: 200,
    })
    const res = {
      locals: resLocals,
      redirect: () => {
        expect(sendFileSizeMetric).toHaveBeenCalledTimes(3)
        done()
      },
    }
    combinedMultipleFilesAndFormSave({
      uploadFormFieldNames: ['partBFileName', 'oasysFileName', 'emailFileName'],
      validator: validatePartB,
      saveToApiFn,
    })(req, res)
  })

  it('sets a confirmation message if successful', done => {
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = files
      cb()
    })
    saveToApiFn.mockResolvedValue({
      status: 200,
    })
    const res = {
      locals: resLocals,
      redirect: httpStatus => {
        expect(saveToApiFn).toHaveBeenCalledTimes(1)
        expect(req.session.confirmationMessage).toBeDefined()
        expect(httpStatus).toEqual(303)
        done()
      },
    }
    combinedMultipleFilesAndFormSave({
      uploadFormFieldNames: ['partBFileName', 'oasysFileName', 'emailFileName'],
      validator: validatePartB,
      saveToApiFn,
    })(req, res)
  })

  it('creates an error and reloads the page if the save fails', done => {
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = files
      cb()
    })
    saveToApiFn.mockRejectedValue(new Error('test'))
    const res = {
      locals: resLocals,
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
    combinedMultipleFilesAndFormSave({
      uploadFormFieldNames: ['partBFileName', 'oasysFileName', 'emailFileName'],
      validator: validatePartB,
      saveToApiFn,
    })(req, res)
  })

  it("stores an error and unsaved values, doesn't call the save function and reloads the page if the upload from the browser to the app fails", done => {
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      cb(req, res, new Error('Upload failed'))
    })
    const res = {
      locals: resLocals,
      redirect: (httpStatus, path) => {
        expect(saveToApiFn).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            name: 'uploadError',
            text: 'An error occurred uploading the files',
          },
        ])
        expect(req.session.unsavedValues).toEqual({
          partBDetails: 'details text',
          partBReceivedDateParts: {
            day: '05',
            month: '03',
            year: '2022',
          },
        })
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/upload-page')
        done()
      },
    }
    combinedMultipleFilesAndFormSave({
      uploadFormFieldNames: ['partBFileName', 'oasysFileName', 'emailFileName'],
      validator: validatePartB,
      saveToApiFn,
    })(req, res)
  })

  it('creates an error and reloads the page if the email has a virus', done => {
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = files
      cb()
    })
    saveToApiFn.mockRejectedValue({
      data: {
        status: '400 BAD_REQUEST',
        fileErrors: [
          {
            category: 'PART_B_RISK_REPORT',
            fileName: 'part b.pdf',
            error: 'VirusFoundException',
          },
          {
            category: 'OASYS_RISK_ASSESSMENT',
            fileName: 'oasysFile.pdf',
            error: 'VirusFoundException',
          },
          {
            category: 'PART_B_EMAIL_FROM_PROBATION',
            fileName: 'my email.msg',
            error: 'VirusFoundException',
          },
        ],
      },
    })
    const res = {
      locals: resLocals,
      redirect: (httpStatus, path) => {
        expect(req.session.errors).toEqual([
          {
            href: '#partBFileName',
            name: 'partBFileName',
            text: 'part b.pdf contains a virus',
          },
          {
            href: '#oasysFileName',
            name: 'oasysFileName',
            text: 'oasysFile.pdf contains a virus',
          },
          {
            href: '#emailFileName',
            name: 'emailFileName',
            text: 'my email.msg contains a virus',
          },
        ])
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/upload-page')
        done()
      },
    }
    combinedMultipleFilesAndFormSave({
      uploadFormFieldNames: ['partBFileName', 'oasysFileName', 'emailFileName'],
      validator: validatePartB,
      saveToApiFn,
    })(req, res)
  })

  it('calls error middleware if an error is thrown', async () => {
    const err = new Error('test')
    jest.spyOn(processUploadExports, 'processUpload').mockRejectedValue(err)
    const res = mockRes()
    const next = jest.fn()
    await combinedMultipleFilesAndFormSave({
      uploadFormFieldNames: ['partBFileName', 'oasysFileName', 'emailFileName'],
      validator: validatePartB,
      saveToApiFn: jest.fn(),
    })(req, res, next)
    expect(next).toHaveBeenCalledWith(err)
  })
})
