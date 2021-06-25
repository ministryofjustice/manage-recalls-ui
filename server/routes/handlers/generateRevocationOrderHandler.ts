import type { RequestHandler } from 'express'
import { generateRevocationOrder } from '../../clients/manageRecallsApi/manageRecallsApiClient'

export default function generateRevocationOrderHandler(): RequestHandler {
  return async (req, res, next) => {
    const base64EncodedPdf = await generateRevocationOrder(res.locals.user.token)
    const pdfContentsByteArray = Buffer.from(base64EncodedPdf.contents, 'base64')

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="revocation-order.pdf"',
    })
    res.end(pdfContentsByteArray)
  }
}
