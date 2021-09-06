import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import downloadPdfHandler from './downloadPdfHandler'

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('downloadPdfHandler', () => {
  describe('downloadPdfHandler', () => {
    const filename = 'downloaded-file-name.pdf'
    const expectedPdfContents = 'pdf contents'
    const expectedPdf = { content: Buffer.from(expectedPdfContents).toString('base64') }
    const dummyDownloadFunction = () => Promise.resolve(expectedPdf)

    it('should return pdf from manage recalls api', async () => {
      const recallId = 'RECALL_ID'

      const req = mockGetRequest({ query: { recallId } })
      const { res, next } = mockResponseWithAuthenticatedUser(userToken.access_token)

      await downloadPdfHandler('/ui-path', filename, dummyDownloadFunction)(req, res, next)

      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      })
      expect(res.end).toHaveBeenCalledWith(Buffer.from(expectedPdfContents))
    })

    it('should respond with 400 if recallId is undefined', async () => {
      const req = mockGetRequest({ query: {} })
      const { res, next } = mockResponseWithAuthenticatedUser(userToken.access_token)

      await downloadPdfHandler('/ui-path', filename, dummyDownloadFunction)(req, res, next)

      expect(res.sendStatus).toHaveBeenCalledWith(400)
    })
  })
})
