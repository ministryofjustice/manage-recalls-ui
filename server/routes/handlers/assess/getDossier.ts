import type { RequestHandler } from 'express'
import { getDossier } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'

export default function getDossierHandler(): RequestHandler {
  return async (req, res, next) => {
    const { recallId } = req.query
    if (typeof recallId === 'undefined') {
      logger.error('/get-dossier called without a recallId')
      return res.sendStatus(400)
    }
    const base64EncodedPdf = await getDossier(recallId as string, res.locals.user.token)
    const pdfContentsByteArray = Buffer.from(base64EncodedPdf.content, 'base64')

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="dossier.pdf"',
    })
    res.end(pdfContentsByteArray)
  }
}
