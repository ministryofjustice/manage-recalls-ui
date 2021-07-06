import type {RequestHandler} from 'express'
import {generateRevocationOrder} from '../../clients/manageRecallsApi/manageRecallsApiClient'

export default function generateRevocationOrderHandler(): RequestHandler {
    return async (req, res, next) => {
        const {nomsNumber} = req.query
        if (typeof nomsNumber === 'undefined') {
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
