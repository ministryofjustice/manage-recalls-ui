// @ts-nocheck
import { combinedMultipleFilesAndFormSave } from './combinedMultipleFilesAndFormSave'
import { mockReq } from './testUtils/mockRequestUtils'
import { uploadStorageFields } from './documents/upload/helpers/uploadStorage'
import { validatePartB } from './partB/validators/validatePartB'

jest.mock('./documents/upload/helpers/uploadStorage')

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
        details: 'details text',
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
        expect(path).toEqual('/recalls/789/view-recall')
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
      redirect: (httpStatus, path) => {
        expect(saveToApiFn).toHaveBeenCalledTimes(1)
        expect(req.session.confirmationMessage).toEqual({
          heading: 'Part B added',
          items: [
            {
              link: {
                href: '#uploaded-documents',
                text: 'View',
              },
              text: 'Part B report and OASys uploaded.',
            },
            {
              link: {
                href: '#recallDetails-part-b',
                text: 'View',
              },
              text: 'Part B email and note added.',
            },
            {
              text: 'Re-release recommendation added and recall moved to Dossier team list',
            },
          ],
          bannerType: 'message_group',
        })
        expect(httpStatus).toEqual(303)
        expect(path).toEqual('/recalls/789/view-recall')
        done()
      },
    }
    combinedMultipleFilesAndFormSave({
      uploadFormFieldNames: ['partBFileName', 'oasysFileName', 'emailFileName'],
      validator: validatePartB,
      saveToApiFn,
    })(req, res)
  })

  it('redirects to the fromPage if supplied eg check answers', done => {
    ;(uploadStorageFields as jest.Mock).mockReturnValue((request, response, cb) => {
      req.files = files
      cb()
    })
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
          details: 'details text',
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
        category: 'PART_B_RISK_REPORT',
        fileName: 'my part b.pdf',
        error: 'VirusFoundException',
      },
    })
    const res = {
      locals: resLocals,
      redirect: (httpStatus, path) => {
        expect(req.session.errors).toEqual([
          {
            href: '#partBFileName',
            name: 'partBFileName',
            text: 'my part b.pdf contains a virus',
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
})
