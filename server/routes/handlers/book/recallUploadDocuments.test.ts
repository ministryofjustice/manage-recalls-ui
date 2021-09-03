// @ts-nocheck
import { getMockRes } from '@jest-mock/express'
import { downloadDocument } from './recallUploadDocuments'
import { getRecallDocument } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { mockGetRequest } from '../../testutils/mockRequestUtils'
import { GetDocumentResponse } from '../../../@types/manage-recalls-api/models/GetDocumentResponse'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('downloadDocument', () => {
  let spies
  let req
  let resp

  beforeEach(() => {
    spies = {
      contentType: jest.fn(),
      header: jest.fn(),
      send: jest.fn(),
    }
    req = mockGetRequest({ params: { nomsNumber: '456', recallId: '789' } })
    const { res } = getMockRes({
      ...spies,
      locals: { user: {} },
    })
    resp = res
  })

  describe('PDF', () => {
    it('sets headers so the document is opened not downloaded', async () => {
      ;(getRecallDocument as jest.Mock).mockResolvedValue({
        documentId: '123',
        category: GetDocumentResponse.category.LICENCE,
        content: 'abc',
      })
      await downloadDocument(req, resp)
      expect(spies.contentType).toHaveBeenCalledWith('application/pdf')
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'inline; filename="licence.pdf"')
    })
  })

  describe('Email', () => {
    it('sets headers so the email is downloaded not opened', async () => {
      ;(getRecallDocument as jest.Mock).mockResolvedValue({
        documentId: '123',
        category: GetDocumentResponse.category.RECALL_NOTIFICATION_EMAIL,
        content: 'abc',
        fileName: 'recall-notification.msg',
      })
      await downloadDocument(req, resp)
      expect(spies.contentType).toHaveBeenCalledWith('application/octet-stream')
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="recall-notification.msg"')
    })
  })
})
