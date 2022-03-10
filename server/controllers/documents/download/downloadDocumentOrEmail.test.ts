import { Request, Response } from 'express'
import { downloadDocumentOrEmail } from './downloadDocumentOrEmail'
import { getDocumentWithContents } from '../../../clients/manageRecallsApiClient'

jest.mock('../../../clients/manageRecallsApiClient')

const recallId = '123'
const documentId = '88'

describe('downloadDocumentOrEmail', () => {
  const downloadFileContents = 'file contents'
  let req: Request
  let res: Response

  beforeEach(() => {
    req = { params: { recallId, documentId } } as unknown as Request
    res = {
      locals: { documentId, user: { token: '000' } },
      contentType: jest.fn(),
      header: jest.fn(),
      send: jest.fn(),
    } as unknown as Response
  })

  afterEach(() => jest.resetAllMocks())

  it('should serve a recall notification', async () => {
    const fileName = 'IN CUSTODY RECALL BADGER BOBBY A1234AB.pdf'
    ;(getDocumentWithContents as jest.Mock).mockResolvedValue({
      category: 'RECALL_NOTIFICATION',
      content: downloadFileContents,
      fileName,
    })
    await downloadDocumentOrEmail(req, res)
    expect(res.contentType).toHaveBeenCalledWith('application/pdf')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(downloadFileContents, 'base64'))
  })

  it('should serve a dossier', async () => {
    const fileName = 'BADGER BOBBY A1234AB RECALL DOSSIER.pdf'
    ;(getDocumentWithContents as jest.Mock).mockResolvedValue({
      category: 'DOSSIER',
      content: downloadFileContents,
      fileName,
    })
    await downloadDocumentOrEmail(req, res)
    expect(res.contentType).toHaveBeenCalledWith('application/pdf')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(downloadFileContents, 'base64'))
  })

  it('should serve a letter to prison', async () => {
    const fileName = 'BADGER BOBBY A1234AB LETTER TO PRISON.pdf'
    ;(getDocumentWithContents as jest.Mock).mockResolvedValue({
      category: 'LETTER_TO_PRISON',
      content: downloadFileContents,
      fileName,
    })
    await downloadDocumentOrEmail(req, res)
    expect(res.contentType).toHaveBeenCalledWith('application/pdf')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(downloadFileContents, 'base64'))
  })

  it('should serve a revocation order', async () => {
    const fileName = 'BADGER BOBBY A1234AB REVOCATION ORDER.pdf'
    ;(getDocumentWithContents as jest.Mock).mockResolvedValue({
      category: 'REVOCATION_ORDER',
      content: downloadFileContents,
      fileName,
    })
    await downloadDocumentOrEmail(req, res)
    expect(res.contentType).toHaveBeenCalledWith('application/pdf')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(downloadFileContents, 'base64'))
  })

  it('should serve reasons for recall', async () => {
    const fileName = 'BADGER BOBBY A1234AB REASONS FOR RECALL.pdf'
    ;(getDocumentWithContents as jest.Mock).mockResolvedValue({
      category: 'REASONS_FOR_RECALL',
      content: downloadFileContents,
      fileName,
    })
    await downloadDocumentOrEmail(req, res)
    expect(res.contentType).toHaveBeenCalledWith('application/pdf')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(downloadFileContents, 'base64'))
  })

  it('should serve an uploaded Part A', async () => {
    ;(getDocumentWithContents as jest.Mock).mockResolvedValue({
      category: 'PART_A_RECALL_REPORT',
      content: downloadFileContents,
    })
    await downloadDocumentOrEmail(req, res)
    expect(res.contentType).toHaveBeenCalledWith('application/pdf')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="Part A.pdf"`)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(downloadFileContents, 'base64'))
  })

  it('uses original filename for uploaded Other documents', async () => {
    ;(getDocumentWithContents as jest.Mock).mockResolvedValue({
      category: 'OTHER',
      content: downloadFileContents,
      fileName: 'report.pdf',
    })
    await downloadDocumentOrEmail(req, res)
    expect(res.contentType).toHaveBeenCalledWith('application/pdf')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="report.pdf"`)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(downloadFileContents, 'base64'))
  })

  it('should serve an uploaded recall request email', async () => {
    ;(getDocumentWithContents as jest.Mock).mockResolvedValue({
      category: 'RECALL_REQUEST_EMAIL',
      content: downloadFileContents,
      fileName: 'email.eml',
    })
    await downloadDocumentOrEmail(req, res)
    expect(res.contentType).toHaveBeenCalledWith('application/octet-stream')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="email.eml"`)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(downloadFileContents, 'base64'))
  })

  it('should serve an example note document with valid contentType, Content-Disposition and encoded contents', async () => {
    ;(getDocumentWithContents as jest.Mock).mockResolvedValue({
      category: 'NOTE_DOCUMENT',
      content: downloadFileContents,
      fileName: 'note.doc',
    })
    await downloadDocumentOrEmail(req, res)
    expect(res.contentType).toHaveBeenCalledWith('application/msword')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="note.doc"`)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(downloadFileContents, 'base64'))
  })

  it('should serve an example note document where the filename includes a non-ISO-8859-1 character with adapted and encoded filename in Content-Disposition', async () => {
    ;(getDocumentWithContents as jest.Mock).mockResolvedValue({
      category: 'NOTE_DOCUMENT',
      content: downloadFileContents,
      fileName: 'Weeknote 42 – Friday 4 March 2022.pdf',
    })
    await downloadDocumentOrEmail(req, res)
    expect(res.contentType).toHaveBeenCalledWith('application/pdf')
    expect(res.header).toHaveBeenCalledWith(
      'Content-Disposition',
      `attachment; filename="Weeknote 42 ? Friday 4 March 2022.pdf"; filename*=UTF-8''Weeknote%2042%20%E2%80%93%20Friday%204%20March%202022.pdf`
    )
    expect(res.send).toHaveBeenCalledWith(Buffer.from(downloadFileContents, 'base64'))
  })

  it('should serve an email note document with contentType application/octet-stream', async () => {
    ;(getDocumentWithContents as jest.Mock).mockResolvedValue({
      category: 'NOTE_DOCUMENT',
      content: downloadFileContents,
      fileName: 'note.eml',
    })
    await downloadDocumentOrEmail(req, res)
    expect(res.contentType).toHaveBeenCalledWith('application/octet-stream')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="note.eml"`)
    expect(res.send).toHaveBeenCalledWith(Buffer.from(downloadFileContents, 'base64'))
  })
})
