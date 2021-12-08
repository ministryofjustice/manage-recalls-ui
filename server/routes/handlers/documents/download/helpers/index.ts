import { DocumentCategoryMetadata } from '../../../../../@types/documents'
import { documentCategories } from '../../documentCategories'
import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'

export const generatedDocCategoriesList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'generated')

export const getGeneratedDocFileName = ({
  firstName,
  lastName,
  bookingNumber,
  docCategory,
}: {
  firstName: string
  lastName: string
  bookingNumber: string
  docCategory: RecallDocument.category
}) => {
  const details = `${formatPersonName({ firstName, lastName })}${formatBookingNumber(bookingNumber)}`
  switch (docCategory) {
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
export const getGeneratedDocUrlPath = ({
  recallId,
  nomsNumber,
  documentId,
  docCategory,
}: {
  recallId: string
  nomsNumber: string
  documentId?: string
  docCategory: RecallDocument.category
}): string | undefined => {
  const basePath = `/persons/${nomsNumber}/recalls/${recallId}/documents/`
  switch (docCategory) {
    case RecallDocument.category.RECALL_NOTIFICATION:
      return `${basePath}recall-notification`
    case RecallDocument.category.DOSSIER:
      return `${basePath}dossier`
    case RecallDocument.category.LETTER_TO_PRISON:
      return `${basePath}letter-to-prison`
    case RecallDocument.category.REVOCATION_ORDER:
      return `${basePath}revocation-order/${documentId}`
    case RecallDocument.category.REASONS_FOR_RECALL:
      return `${basePath}reasons-for-recall/${documentId}`
    default:
      return undefined
  }
}
export const formatPersonName = ({ firstName = '', lastName = '' }: { firstName?: string; lastName?: string }) =>
  `${lastName?.toUpperCase()} ${firstName?.toUpperCase()}`

export const formatBookingNumber = (bookingNumber: string) => (bookingNumber ? ` ${bookingNumber.toUpperCase()}` : '')
