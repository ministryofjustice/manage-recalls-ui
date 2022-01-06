import {
  DecoratedUploadedDoc,
  DecoratedMissingDocumentsRecord,
  DocumentCategoryMetadata,
  DecoratedGeneratedDoc,
} from '../../../../../@types/documents'
import { documentCategories } from '../../documentCategories'
import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { getPersonAndRecall } from '../../../helpers/fetch/getPersonAndRecall'
import { MissingDocumentsRecord } from '../../../../../@types/manage-recalls-api'
import { sortList } from '../../../helpers'

export const generatedDocCategoriesList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'generated')

export const getGeneratedDocFileName = ({
  firstName,
  lastName,
  bookingNumber,
  category,
}: {
  firstName: string
  lastName: string
  bookingNumber: string
  category: RecallDocument.category
}) => {
  const details = `${formatPersonName({ firstName, lastName })}${formatBookingNumber(bookingNumber)}`
  switch (category) {
    case RecallDocument.category.RECALL_NOTIFICATION:
      return `IN CUSTODY RECALL ${details}.pdf`
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
}: {
  recallId: string
  nomsNumber: string
  document: RecallDocument
  firstName: string
  lastName: string
  bookingNumber: string
}): DecoratedGeneratedDoc => {
  return {
    ...document,
    type: 'generated',
    fileName: getGeneratedDocFileName({
      firstName,
      lastName,
      bookingNumber,
      category: document.category,
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
  nomsNumber,
  category,
  token,
}: {
  recallId: string
  nomsNumber: string
  category: RecallDocument.category
  token: string
}) => {
  const { person, recall } = await getPersonAndRecall({
    nomsNumber,
    recallId,
    token,
  })
  return getGeneratedDocFileName({
    firstName: person.firstName,
    lastName: person.lastName,
    bookingNumber: recall.bookingNumber,
    category,
  })
}

export const decorateMissingDocumentsRecords = ({
  missingDocumentsRecords,
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
        fileName: emailFileName,
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
