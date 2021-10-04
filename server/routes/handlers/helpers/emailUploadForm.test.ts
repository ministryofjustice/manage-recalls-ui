// @ts-nocheck
import { emailUploadForm } from './emailUploadForm'
import { addRecallDocument, updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { mockPostRequest } from '../../testutils/mockRequestUtils'
import { uploadStorageField } from './uploadStorage'
import { validateDossierEmail } from '../dossier/helpers/validateDossierEmail'
import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('./uploadStorage')

const handler = emailUploadForm({
  emailFieldName: 'dossierEmailFileName',
  validator: validateDossierEmail,
  documentCategory: ApiRecallDocument.category.DOSSIER_EMAIL,
  nextPageUrlSuffix: 'dossier-confirmation',
})

describe('confirmEmailSent', () => {
  let req
  beforeEach(() => {
    req = mockPostRequest({
      params: { nomsNumber: '456', recallId: '789' },
      body: {
        confirmDossierEmailSent: 'YES',
        dossierEmailSentDateYear: '2021',
        dossierEmailSentDateMonth: '5',
        dossierEmailSentDateDay: '20',
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
        expect(path).toEqual('/persons/456/recalls/789/dossier-confirmation')
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
            href: '#dossierEmailFileName',
            name: 'dossierEmailFileName',
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
            href: '#dossierEmailFileName',
            name: 'dossierEmailFileName',
            text: 'The selected file must be an .msg or .eml',
          },
        ])
        done()
      },
    }
    handler(req, res)
  })
})
