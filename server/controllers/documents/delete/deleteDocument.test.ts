// @ts-nocheck
import { deleteRecallDocument, getRecall } from '../../../clients/manageRecallsApiClient'
import { GetDocumentResponse } from '../../../@types/manage-recalls-api/models/GetDocumentResponse'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { deleteDocument } from './deleteDocument'

jest.mock('../../../clients/manageRecallsApiClient')

describe('deleteDocument', () => {
  let req
  const recallId = '789'

  beforeEach(() => {
    req = { params: { recallId }, session: {} }
  })

  it('deletes a document', done => {
    const documentId = '123'
    const fromPage = 'check-answers'
    const userToken = '000'
    const fileName = 'licence.pdf'
    const basePath = `/recalls/${recallId}/`
    ;(getRecall as jest.Mock).mockResolvedValue({
      status: RecallResponse.status.BEING_BOOKED_ON,
      documents: [
        {
          documentId,
          category: GetDocumentResponse.category.LICENCE,
          fileName,
          content: 'abc',
        },
      ],
    })
    req.body = {
      delete: documentId,
    }
    req.originalUrl = `${basePath}upload-documents`
    const res = {
      locals: {
        user: {
          token: userToken,
        },
        urlInfo: {
          basePath,
          fromPage,
        },
      },
      redirect: (httpStatus, path) => {
        expect(req.session.confirmationMessage).toEqual({
          text: `${fileName} has been deleted`,
          type: 'success',
        })
        expect(deleteRecallDocument).toHaveBeenCalledWith(recallId, documentId, userToken)
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(req.originalUrl)
        done()
      },
    }
    deleteDocument(req, res)
  })

  it('errors if deletion is attempted when fromPage is invalid', async () => {
    const documentId = '123'
    const fromPage = 'view-recall'
    const userToken = '000'
    const fileName = 'licence.pdf'
    const basePath = `/recalls/${recallId}/`
    ;(getRecall as jest.Mock).mockResolvedValue({
      status: RecallResponse.status.BEING_BOOKED_ON,
      documents: [
        {
          documentId,
          category: GetDocumentResponse.category.LICENCE,
          fileName,
          content: 'abc',
        },
      ],
    })
    req.body = {
      delete: documentId,
    }
    req.originalUrl = `${basePath}upload-documents`
    const res = {
      locals: {
        user: {
          token: userToken,
        },
        urlInfo: {
          basePath,
          fromPage,
        },
      },
      redirect: jest.fn(),
    }
    try {
      await deleteDocument(req, res)
    } catch (err) {
      expect(err.message).toEqual('Attempted to delete a document when fromPage was set to: view-recall')
    }
  })
})
