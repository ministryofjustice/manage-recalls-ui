import type { RequestHandler } from 'express'
import { getRevocationOrder } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../logger'

export default function getRevocationOrderHandler(): RequestHandler {
  return async (req, res, next) => {
    const { recallId } = req.query
    if (typeof recallId === 'undefined') {
      logger.error('/get-revocation-order called without a recallId')
      return res.sendStatus(400)
    }
    const base64EncodedPdf = await getRevocationOrder(recallId as string, res.locals.user.token)
    const pdfContentsByteArray = Buffer.from(base64EncodedPdf.content, 'base64')

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="revocation-order.pdf"',
    })
    res.end(pdfContentsByteArray)
  }
}
