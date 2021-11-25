import type { Request, Response } from 'express'
import {
  getGeneratedDocument,
  getRecall,
  getRecallNotification,
  getStoredDocument,
} from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { getPerson } from '../personCache'
import { isInvalid } from '../index'
import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { Pdf } from '../../../../@types/manage-recalls-api/models/Pdf'
import { ObjectMap } from '../../../../@types'
import { getGeneratedDocFileName } from './index'

type DownloadFn = (params: ObjectMap<string>, token: string, uuid?: string) => Promise<Pdf>

const downloadNamedPdfHandler =
  (downloadFn: DownloadFn, docCategory: ApiRecallDocument.category) => async (req: Request, res: Response) => {
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
    const personDetails = person.status === 'fulfilled' ? person.value : {}
    const bookingNumber = recall.status === 'fulfilled' ? recall.value.bookingNumber : ''
    const fileName = getGeneratedDocFileName({
      firstName: personDetails.firstName,
      lastName: personDetails.lastName,
      bookingNumber,
      docCategory,
    })
    const pdfContentsByteArray = Buffer.from(pdf.value.content, 'base64')

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
    })
    res.end(pdfContentsByteArray)
  }

export const downloadRecallNotification = downloadNamedPdfHandler(
  getRecallNotification(),
  ApiRecallDocument.category.RECALL_NOTIFICATION
)

export const downloadDossier = downloadNamedPdfHandler(
  getGeneratedDocument('dossier'),
  ApiRecallDocument.category.DOSSIER
)

export const downloadLetterToPrison = downloadNamedPdfHandler(
  getGeneratedDocument('letter-to-prison'),
  ApiRecallDocument.category.LETTER_TO_PRISON
)

export const downloadRevocationOrder = downloadNamedPdfHandler(
  getStoredDocument,
  ApiRecallDocument.category.REVOCATION_ORDER
)

export const downloadReasonsForRecallOrder = downloadNamedPdfHandler(
  getStoredDocument,
  ApiRecallDocument.category.REASONS_FOR_RECALL
)
