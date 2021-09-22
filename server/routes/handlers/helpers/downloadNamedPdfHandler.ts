import type { Request, Response } from 'express'
import {
  getRecall,
  getGeneratedDocument,
  searchByNomsNumber,
} from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { isInvalid } from './index'
import { Pdf } from '../../../@types/manage-recalls-api'

type FormatFn = (args: { personName: string; bookingNumber: string }) => string

type DownloadFn = (recallId: string, token: string) => Promise<Pdf>

const downloadNamedPdfHandler =
  (downloadFn: DownloadFn, formatNameFn: FormatFn) => async (req: Request, res: Response) => {
    const { nomsNumber, recallId } = req.params
    if (isInvalid(nomsNumber) || isInvalid(recallId)) {
      res.sendStatus(400)
      return
    }
    const [person, recall, pdf] = await Promise.allSettled([
      searchByNomsNumber(nomsNumber as string, res.locals.user.token),
      getRecall(recallId, res.locals.user.token),
      downloadFn(recallId as string, res.locals.user.token),
    ])
    // if there's no PDF, we can't continue
    if (pdf.status === 'rejected') {
      return res.sendStatus(500)
    }
    // if the other two calls fail to get metadata, we could still serve the PDF with a generic filename
    const personName =
      person.status === 'fulfilled'
        ? `${person.value?.lastName?.toUpperCase()} ${person.value?.firstName?.toUpperCase()}`
        : ''
    const bookingNumber = recall.status === 'fulfilled' ? ` ${recall.value?.bookingNumber?.toUpperCase()}` : ''
    const fileName = formatNameFn({ personName, bookingNumber })
    const pdfContentsByteArray = Buffer.from(pdf.value.content, 'base64')

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
    })
    res.end(pdfContentsByteArray)
  }

export const downloadRecallNotification = downloadNamedPdfHandler(
  getGeneratedDocument('recallNotification'),
  ({ personName, bookingNumber }) => `IN CUSTODY RECALL ${personName}${bookingNumber}.pdf`
)

export const downloadDossier = downloadNamedPdfHandler(
  getGeneratedDocument('dossier'),
  ({ personName, bookingNumber }) => `${personName}${bookingNumber} RECALL DOSSIER.pdf`
)

export const downloadLetter = downloadNamedPdfHandler(
  getGeneratedDocument('letter'),
  ({ personName, bookingNumber }) => `${personName}${bookingNumber} LETTER TO PRISON.pdf`
)
