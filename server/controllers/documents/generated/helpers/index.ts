import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { getRecall } from '../../../../clients/manageRecallsApiClient'
import { DecoratedGeneratedDoc, DocumentCategoryMetadata } from '../../../../@types/documents'
import { documentCategories } from '../../documentCategories'
import { RecallResponse } from '../../../../@types/manage-recalls-api'
import { isInCustody } from '../../../utils/recallStatus'
import { documentDownloadUrl, formatBookingNumber, formatPersonName } from '../../download/helpers'

export const generatedDocCategoriesList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'generated')

export const getGeneratedDocumentFileName = async ({
  recallId,
  category,
  token,
}: {
  recallId: string
  category: RecallDocument.category
  token: string
}) => {
  const recall = await getRecall(recallId, token)
  return formatGeneratedDocFileName({
    recall,
    category,
  })
}

// see if the doc has already been generated, if so use that filename, if not create a filename
export const getGeneratedDocFileName = ({
  recall,
  category,
}: {
  recall: RecallResponse
  category: RecallDocument.category
}) => {
  const existing = recall.documents.find(doc => doc.category === category)
  if (existing) {
    return existing.fileName
  }
  return formatGeneratedDocFileName({ recall, category })
}

export const formatGeneratedDocFileName = ({
  recall,
  category,
}: {
  recall: RecallResponse
  category: RecallDocument.category
}) => {
  const { firstName, lastName, bookingNumber } = recall
  const inCustody = isInCustody(recall)
  const details = `${formatPersonName({ firstName, lastName })}${formatBookingNumber(bookingNumber)}`
  switch (category) {
    case RecallDocument.category.RECALL_NOTIFICATION:
      return `${inCustody === false ? 'NOT ' : ''}IN CUSTODY RECALL ${details}.pdf`
    case RecallDocument.category.DOSSIER:
      return `${details} RECALL DOSSIER.pdf`
    case RecallDocument.category.LETTER_TO_PRISON:
      return `${details} LETTER TO PRISON.pdf`
    case RecallDocument.category.LETTER_TO_PROBATION:
      return `${details} LETTER TO PROBATION.pdf`
    case RecallDocument.category.REVOCATION_ORDER:
      return `${details} REVOCATION ORDER.pdf`
    case RecallDocument.category.REASONS_FOR_RECALL:
      return `${details} REASONS FOR RECALL.pdf`
    default:
      return 'document.pdf'
  }
}

export const generatedDocMetaData = ({
  recall,
  document,
}: {
  recall: RecallResponse
  document: RecallDocument
}): DecoratedGeneratedDoc => {
  return {
    ...document,
    type: 'generated',
    url: documentDownloadUrl({
      recallId: recall.recallId,
      documentId: document.documentId,
    }),
  }
}
