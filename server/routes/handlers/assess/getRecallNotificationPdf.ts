import type { Request, Response } from 'express'
import {
  getRecall,
  getRecallNotification,
  searchByNomsNumber,
} from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { isInvalid } from '../helpers'

export const getRecallNotificationPdf = async (req: Request, res: Response) => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    res.sendStatus(400)
    return
  }
  const [person, recall, pdf] = await Promise.allSettled([
    searchByNomsNumber(nomsNumber as string, res.locals.user.token),
    getRecall(recallId, res.locals.user.token),
    getRecallNotification(recallId as string, res.locals.user.token),
  ])
  // if there's no PDF, we can't continue
  if (pdf.status === 'rejected') {
    return res.sendStatus(500)
  }
  // if the other two calls fail to get metadata, we could still serve the PDF with a generic filename
  const name =
    person.status === 'fulfilled'
      ? ` ${person.value?.lastName?.toUpperCase()} ${person.value?.firstName?.toUpperCase()}`
      : ''
  const bookingNumber = recall.status === 'fulfilled' ? ` ${recall.value?.bookingNumber?.toUpperCase()}` : ''
  const fileName = `IN CUSTODY RECALL${name}${bookingNumber}.pdf`
  const pdfContentsByteArray = Buffer.from(pdf.value.content, 'base64')

  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${fileName}"`,
  })
  res.end(pdfContentsByteArray)
}
