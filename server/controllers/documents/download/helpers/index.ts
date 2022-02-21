import {
  DecoratedUploadedDoc,
  DecoratedMissingDocumentsRecord,
  DocumentCategoryMetadata,
  DecoratedGeneratedDoc,
  DecoratedRescindRecord,
} from '../../../../@types/documents'
import { documentCategories } from '../../documentCategories'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { MissingDocumentsRecord, RescindRecord } from '../../../../@types/manage-recalls-api'
import { getRecall } from '../../../../clients/manageRecallsApiClient'
import { isInCustody } from '../../../utils/recallStatus'
import { sortList } from '../../../utils/lists'

export const generatedDocCategoriesList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'generated')

export const getGeneratedDocFileName = ({
  firstName,
  lastName,
  bookingNumber,
  category,
  inCustody,
}: {
  firstName: string
  lastName: string
  bookingNumber: string
  category: RecallDocument.category
  inCustody?: boolean
}) => {
  const details = `${formatPersonName({ firstName, lastName })}${formatBookingNumber(bookingNumber)}`
  switch (category) {
    case RecallDocument.category.RECALL_NOTIFICATION:
      return `${inCustody === false ? 'NOT ' : ''}IN CUSTODY RECALL ${details}.pdf`
    case RecallDocument.category.DOSSIER:
      return `${details} RECALL DOSSIER.pdf`
    case RecallDocument.category.LETTER_TO_PRISON:
      return `${details} LETTER TO PRISON.pdf`
    case RecallDocument.category.REVOCATION_ORDER:
      return `${details} REVOCATION ORDER.pdf`
    case RecallDocument.category.REASONS_FOR_RECALL:
      return `${details} REASONS FOR RECALL.pdf`
    default:
      return 'document.pdf'
  }
}

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

export const generatedDocMetaData = ({
  recallId,
  nomsNumber,
  document,
  firstName,
  lastName,
  bookingNumber,
  inCustody,
}: {
  recallId: string
  nomsNumber: string
  document: RecallDocument
  firstName: string
  lastName: string
  bookingNumber: string
  inCustody: boolean
}): DecoratedGeneratedDoc => {
  return {
    ...document,
    type: 'generated',
    fileName: getGeneratedDocFileName({
      firstName,
      lastName,
      bookingNumber,
      category: document.category,
      inCustody,
    }),
    url: documentDownloadUrl({
      recallId,
      nomsNumber,
      documentId: document.documentId,
    }),
  }
}

export const generatedDocumentFileName = async ({
  recallId,
  category,
  token,
}: {
  recallId: string
  category: RecallDocument.category
  token: string
}) => {
  const recall = await getRecall(recallId, token)
  return getGeneratedDocFileName({
    firstName: recall.firstName,
    lastName: recall.lastName,
    bookingNumber: recall.bookingNumber,
    category,
    inCustody: isInCustody(recall),
  })
}

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
