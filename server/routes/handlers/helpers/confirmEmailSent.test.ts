// @ts-nocheck
import { getMockRes } from '@jest-mock/express'
import { confirmEmailSent } from './confirmEmailSent'
import { addRecallDocument, updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { mockGetRequest } from '../../testutils/mockRequestUtils'
import { uploadStorageField } from './uploadStorage'
import { validateDossierEmail } from '../dossier/helpers/validateDossierEmail'
import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../helpers/uploadStorage')

const handler = confirmEmailSent({
  emailFieldName: 'dossierEmailFileName',
  validator: validateDossierEmail,
  documentCategory: ApiRecallDocument.category.DOSSIER_EMAIL,
  nextPageUrlSuffix: 'dossier-confirmation',
})

describe('confirmEmailSent', () => {
  let req
  let resp
  beforeEach(() => {
    req = mockGetRequest({ params: { nomsNumber: '456', recallId: '789' } })
    const { res } = getMockRes({
      locals: { user: {} },
    })
    resp = res
    ;(uploadStorageField as jest.Mock).mockReturnValue((request, response, cb) => {
      req.file = {
        originalname: 'report.pdf',
        buffer: 'def',
      }
      cb()
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('sends the uploaded email to the API', async () => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    await handler(req, resp)
    expect(addRecallDocument).toHaveBeenCalledTimes(1)
    expect(req.session.errors).toBeUndefined()
  })

  it("doesn't save the sent date if the document save fails", done => {
    ;(addRecallDocument as jest.Mock).mockRejectedValue(new Error('test'))
    req.body = {
      confirmDossierEmailSent: 'YES',
      dossierEmailSentDateYear: '2021',
      dossierEmailSentDateMonth: '10',
      dossierEmailSentDateDay: '4',
    }
    const res = {
      locals: { user: {} },
      redirect: () => {
        expect(updateRecall).not.toHaveBeenCalled()
        expect(req.session.errors).toEqual([
          {
            href: '#dossierEmailFileName',
            name: 'dossierEmailFileName',
            text: 'An error occurred uploading the email',
            values: 'report.pdf',
          },
        ])
        done()
      },
    }
    handler(req, res)
  })
})
