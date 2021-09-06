import type { RequestHandler } from 'express'
import logger from '../../../../logger'
import { Pdf } from '../../../@types/manage-recalls-api'

export default function downloadPdfHandler(
  path: string,
  filename: string,
  downloadFunction: (recallId: string, token: string) => Promise<Pdf>
): RequestHandler {
  return async (req, res, next) => {
    const { recallId } = req.query
    if (typeof recallId === 'undefined') {
      logger.error(`${path} called without a recallId`)
      return res.sendStatus(400)
    }
    const base64EncodedPdf = await downloadFunction(recallId as string, res.locals.user.token)
    const pdfContentsByteArray = Buffer.from(base64EncodedPdf.content, 'base64')

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    })
    res.end(pdfContentsByteArray)
  }
}
