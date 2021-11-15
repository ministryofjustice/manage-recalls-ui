import type { Request, Response } from 'express'
import {
  getRecall,
  getGeneratedDocument,
  getRecallNotification,
  getStoredDocument,
} from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { getPerson } from '../personCache'
import { isInvalid } from '../index'
import { Pdf } from '../../../../@types/manage-recalls-api'
import { ObjectMap } from '../../../../@types'

type FormatFn = (args: { personName: string; bookingNumber: string }) => string

type DownloadFn = (params: ObjectMap<string>, token: string, uuid?: string) => Promise<Pdf>

export const formatPersonName = ({ firstName, lastName }: { firstName?: string; lastName?: string }) =>
  `${lastName?.toUpperCase()} ${firstName?.toUpperCase()}`

export const formatBookingNumber = (bookingNumber: string) => (bookingNumber ? ` ${bookingNumber.toUpperCase()}` : '')

const downloadNamedPdfHandler =
  (downloadFn: DownloadFn, formatNameFn: FormatFn) => async (req: Request, res: Response) => {
    const { nomsNumber, recallId, documentId } = req.params
    const { token, uuid } = res.locals.user
    if (isInvalid(nomsNumber) || isInvalid(recallId)) {
      res.sendStatus(400)
      return
    }
    const [person, recall, pdf] = await Promise.allSettled([
      getPerson(nomsNumber as string, token),
      getRecall(recallId, token),
      downloadFn({ recallId, documentId }, token, uuid),
    ])
    // if there's no PDF, we can't continue
    if (pdf.status === 'rejected') {
      return res.sendStatus(500)
    }
    // if the other two calls fail to get metadata, we could still serve the PDF with a generic filename
    const personName = person.status === 'fulfilled' ? formatPersonName(person.value) : ''
    const bookingNumber = recall.status === 'fulfilled' ? formatBookingNumber(recall.value.bookingNumber) : ''
    const fileName = formatNameFn({ personName, bookingNumber })
    const pdfContentsByteArray = Buffer.from(pdf.value.content, 'base64')

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
    })
    res.end(pdfContentsByteArray)
  }

export const downloadRecallNotification = downloadNamedPdfHandler(
  getRecallNotification(),
  ({ personName, bookingNumber }) => `IN CUSTODY RECALL ${personName}${bookingNumber}.pdf`
)

export const downloadDossier = downloadNamedPdfHandler(
  getGeneratedDocument('dossier'),
  ({ personName, bookingNumber }) => `${personName}${bookingNumber} RECALL DOSSIER.pdf`
)

export const downloadLetterToPrison = downloadNamedPdfHandler(
  getGeneratedDocument('letter-to-prison'),
  ({ personName, bookingNumber }) => `${personName}${bookingNumber} LETTER TO PRISON.pdf`
)

export const downloadRevocationOrder = downloadNamedPdfHandler(
  getStoredDocument,
  ({ personName, bookingNumber }) => `${personName}${bookingNumber} REVOCATION ORDER.pdf`
)
