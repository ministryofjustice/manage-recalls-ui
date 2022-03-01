import {
  DecoratedMissingDocumentsRecord,
  DecoratedNote,
  DecoratedRescindRecord,
  DecoratedUploadedDoc,
} from '../../../../@types/documents'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { MissingDocumentsRecord, Note, RescindRecord } from '../../../../@types/manage-recalls-api'
import { sortList } from '../../../utils/lists'

export const documentDownloadUrl = ({
  recallId,
  nomsNumber,
  documentId,
}: {
  recallId: string
  nomsNumber: string
  documentId?: string
}) => `/persons/${nomsNumber}/recalls/${recallId}/documents/${documentId}`

export const formatPersonName = ({ firstName = '', lastName = '' }: { firstName?: string; lastName?: string }) =>
  `${lastName?.toUpperCase()} ${firstName?.toUpperCase()}`

export const formatBookingNumber = (bookingNumber: string) => (bookingNumber ? ` ${bookingNumber.toUpperCase()}` : '')

export const decorateMissingDocumentsRecords = ({
  missingDocumentsRecords = [],
  nomsNumber,
  recallId,
}: {
  missingDocumentsRecords: MissingDocumentsRecord[]
  nomsNumber: string
  recallId: string
}): DecoratedMissingDocumentsRecord[] => {
  if (!missingDocumentsRecords.length) {
    return []
  }
  return sortList<MissingDocumentsRecord>(missingDocumentsRecords, 'version', false).map(
    (record: MissingDocumentsRecord) => {
      const { createdByUserName, createdDateTime, details, version, emailFileName, categories, emailId } = record
      return {
        categories,
        createdByUserName,
        createdDateTime,
        details,
        version,
        emailId,
        fileName: emailFileName || 'Email',
        url: documentDownloadUrl({ recallId, nomsNumber, documentId: emailId }),
      }
    }
  )
}

export const findCategoryInMissingDocumentsRecords = (
  missingDocumentsRecords: MissingDocumentsRecord[],
  category: RecallDocument.category
): MissingDocumentsRecord[] =>
  missingDocumentsRecords.filter((record: MissingDocumentsRecord) => record.categories.includes(category))

export const getDocHistoryStatus = ({
  doc,
  missingDocumentsRecords,
}: {
  doc: DecoratedUploadedDoc
  missingDocumentsRecords: MissingDocumentsRecord[]
}): boolean =>
  Boolean(doc.version > 1 || findCategoryInMissingDocumentsRecords(missingDocumentsRecords, doc.category).length)

export const decorateRescindRecords = ({
  rescindRecords,
  recallId,
  nomsNumber,
}: {
  rescindRecords: RescindRecord[]
  recallId: string
  nomsNumber: string
}): DecoratedRescindRecord[] => {
  const decorated = rescindRecords?.map(rec => ({
    ...rec,
    requestEmailUrl: documentDownloadUrl({ recallId, nomsNumber, documentId: rec.requestEmailId }),
    decisionEmailUrl: documentDownloadUrl({ recallId, nomsNumber, documentId: rec.decisionEmailId }),
  }))
  return sortList(decorated, 'version', false)
}

export const decorateNotes = ({
  notes,
  recallId,
  nomsNumber,
}: {
  notes: Note[]
  recallId: string
  nomsNumber: string
}): DecoratedNote[] => {
  const decorated = notes?.map(note => ({
    ...note,
    documentUrl: documentDownloadUrl({ recallId, nomsNumber, documentId: note.documentId }),
  }))
  return sortList(decorated, 'index', false)
}
