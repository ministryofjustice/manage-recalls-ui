// @ts-nocheck
import { getMockRes } from '@jest-mock/express'
import { mockGetRequest } from '../../../testutils/mockRequestUtils'
import { getStoredDocument } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { GetDocumentResponse } from '../../../../@types/manage-recalls-api/models/GetDocumentResponse'
import { downloadUploadedDocumentOrEmail } from './downloadUploadedDocumentOrEmail'

jest.mock('../../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('downloadUploadedDocumentOrEmail', () => {
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
      ;(getStoredDocument as jest.Mock).mockResolvedValue({
        documentId: '123',
        category: GetDocumentResponse.category.LICENCE,
        content: 'abc',
      })
      await downloadUploadedDocumentOrEmail(req, resp)
      expect(spies.contentType).toHaveBeenCalledWith('application/pdf')
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'inline; filename="Licence.pdf"')
    })

    it('uses original filename if no category filename available (eg Other docs)', async () => {
      ;(getStoredDocument as jest.Mock).mockResolvedValue({
        documentId: '123',
        category: GetDocumentResponse.category.OTHER,
        content: 'abc',
        fileName: 'test.pdf',
      })
      await downloadUploadedDocumentOrEmail(req, resp)
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'inline; filename="test.pdf"')
    })
  })

  describe('Email', () => {
    it('sets headers so the email is downloaded not opened', async () => {
      ;(getStoredDocument as jest.Mock).mockResolvedValue({
        documentId: '123',
        category: GetDocumentResponse.category.RECALL_NOTIFICATION_EMAIL,
        content: 'abc',
        fileName: 'email.msg',
      })
      await downloadUploadedDocumentOrEmail(req, resp)
      expect(spies.contentType).toHaveBeenCalledWith('application/octet-stream')
      expect(spies.header).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="email.msg"')
    })
  })
})
