import type { RequestHandler } from 'express'
import { generateRevocationOrder } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../logger'

export default function generateRevocationOrderHandler(): RequestHandler {
  return async (req, res, next) => {
    const { nomsNumber } = req.query
    if (typeof nomsNumber === 'undefined') {
      logger.error('/generate-revocation-order called without a nomsNumber')
      return res.sendStatus(400)
    }
    const base64EncodedPdf = await generateRevocationOrder(nomsNumber as string, res.locals.user.token)
    const pdfContentsByteArray = Buffer.from(base64EncodedPdf.content, 'base64')

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="revocation-order.pdf"',
    })
    res.end(pdfContentsByteArray)
  }
}
