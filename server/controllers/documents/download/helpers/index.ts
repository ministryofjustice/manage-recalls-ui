import {
  DecoratedMissingDocuments,
  DecoratedMissingDocumentsRecord,
  DecoratedNote,
  DecoratedPartBRecord,
  DecoratedRescindRecord,
  DecoratedUploadedDoc,
} from '../../../../@types/documents'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { MissingDocuments, MissingDocumentsRecord, Note, RescindRecord } from '../../../../@types/manage-recalls-api'
import { sortList } from '../../../utils/lists'
import { PartBRecord } from '../../../../@types/manage-recalls-api/models/PartBRecord'
import { documentCategories } from '../../documentCategories'

export const documentDownloadUrl = ({ recallId, documentId }: { recallId: string; documentId?: string }) =>
  `/recalls/${recallId}/documents/${documentId}`

export const formatPersonName = ({ firstName = '', lastName = '' }: { firstName?: string; lastName?: string }) =>
  `${lastName?.toUpperCase()} ${firstName?.toUpperCase()}`

export const formatBookingNumber = (bookingNumber: string) => (bookingNumber ? ` ${bookingNumber.toUpperCase()}` : '')

export const decorateMissingDocumentsRecords = ({
  missingDocumentsRecords = [],
  recallId,
}: {
  missingDocumentsRecords: MissingDocumentsRecord[]
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
        url: documentDownloadUrl({ recallId, documentId: emailId }),
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
}: {
  rescindRecords: RescindRecord[]
  recallId: string
}): DecoratedRescindRecord[] => {
  const decorated = rescindRecords?.map(rec => ({
    ...rec,
    requestEmailUrl: documentDownloadUrl({ recallId, documentId: rec.requestEmailId }),
    decisionEmailUrl: documentDownloadUrl({ recallId, documentId: rec.decisionEmailId }),
  }))
  return sortList(decorated, 'version', false)
}

export const decorateMissingDocuments = (missingDocuments: MissingDocuments): DecoratedMissingDocuments => {
  const decoratedRequired = missingDocuments?.required.map(req => documentCategories.find(cat => cat.name === req))
  const decoratedDesired = missingDocuments?.desired.map(req => documentCategories.find(cat => cat.name === req))

  return { required: decoratedRequired, desired: decoratedDesired }
}

export const decorateNotes = ({ notes, recallId }: { notes: Note[]; recallId: string }): DecoratedNote[] => {
  const decorated = notes?.map(note => ({
    ...note,
    documentUrl: documentDownloadUrl({ recallId, documentId: note.documentId }),
  }))
  return sortList(decorated, 'index', false)
}

export const decoratePartBRecords = ({
  partBRecords,
  recallId,
}: {
  partBRecords: PartBRecord[]
  recallId: string
}): DecoratedPartBRecord[] => {
  const decorated = partBRecords?.map(rec => ({
    ...rec,
    emailUrl: documentDownloadUrl({ recallId, documentId: rec.emailId }),
    partBUrl: documentDownloadUrl({ recallId, documentId: rec.partBDocumentId }),
    oasysUrl: documentDownloadUrl({ recallId, documentId: rec.oasysDocumentId }),
  }))
  return sortList(decorated, 'version', false)
}
