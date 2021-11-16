import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { DecoratedDocument, DocumentCategoryMetadata } from '../../../../@types/documents'
import { documentCategories } from './documentCategories'
import { missingNotRequiredDocsList, requiredDocsList, uploadedDocCategoriesList } from './index'
import { formatBookingNumber, formatPersonName } from './downloadNamedPdfHandler'

export const decorateDocs = ({
  docs,
  nomsNumber,
  recallId,
  firstName,
  lastName,
  bookingNumber,
}: {
  docs: ApiRecallDocument[]
  nomsNumber: string
  recallId: string
  firstName?: string
  lastName?: string
  bookingNumber: string
}): {
  documents: DecoratedDocument[]
  appGeneratedDocuments: DecoratedDocument[]
  documentCategories: DocumentCategoryMetadata[]
  requiredDocsMissing: DocumentCategoryMetadata[]
  missingNotRequiredDocs: DocumentCategoryMetadata[]
  recallNotificationEmail?: DecoratedDocument
  revocationOrder?: DecoratedDocument
  recallRequestEmail?: DecoratedDocument
  dossierEmail?: DecoratedDocument
} => {
  const decoratedUploadedDocs = [] as DecoratedDocument[]
  documentCategories.forEach(documentCategory => {
    docs
      .filter(d => documentCategory.name === d.category)
      .forEach(d => {
        decoratedUploadedDocs.push({
          ...d,
          ...documentCategory,
          url: `/persons/${nomsNumber}/recalls/${recallId}/documents/${d.documentId}`,
        })
      })
  })
  const decoratedDocTypes = uploadedDocCategoriesList().map(docType => {
    const uploadedDocs = decoratedUploadedDocs.filter(d => d.name === docType.name)
    return {
      ...docType,
      uploaded: uploadedDocs.map(d => ({ url: d.url, fileName: d.fileName, documentId: d.documentId, index: d.index })),
    }
  })
  const personName = formatPersonName({ firstName, lastName })
  const formattedBookingNumber = formatBookingNumber(bookingNumber)
  return decoratedUploadedDocs.reduce(
    (acc, curr) => {
      if (curr.type === 'document') {
        acc.documents.push(curr)
      } else if (curr.type === 'generated' && curr.showOnFullView === true) {
        acc.appGeneratedDocuments.push(curr)
      }
      if (curr.name === ApiRecallDocument.category.REVOCATION_ORDER) {
        acc.revocationOrder = {
          ...curr,
          label: `${personName}${formattedBookingNumber} REVOCATION ORDER.pdf`,
          url: `/persons/${nomsNumber}/recalls/${recallId}/documents/revocation-order/${curr.documentId}`,
        }
      }
      if (curr.name === ApiRecallDocument.category.RECALL_NOTIFICATION_EMAIL) {
        acc.recallNotificationEmail = curr
      }
      if (curr.name === ApiRecallDocument.category.RECALL_REQUEST_EMAIL) {
        acc.recallRequestEmail = curr
      }
      if (curr.name === ApiRecallDocument.category.DOSSIER_EMAIL) {
        acc.dossierEmail = curr
      }
      return acc
    },
    {
      documents: [],
      appGeneratedDocuments: [],
      documentCategories: decoratedDocTypes,
      requiredDocsMissing: requiredDocsList().filter(
        requiredDocCategory => !decoratedUploadedDocs.find(doc => doc.name === requiredDocCategory.name)
      ),
      missingNotRequiredDocs: missingNotRequiredDocsList().filter(
        requiredDocCategory => !decoratedUploadedDocs.find(doc => doc.name === requiredDocCategory.name)
      ),
      recallNotificationEmail: undefined,
      recallRequestEmail: undefined,
      dossierEmail: undefined,
      revocationOrder: undefined,
    }
  )
}
