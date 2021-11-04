import { ApiRecallDocument } from '../../../../@types/manage-recalls-api'
import { DecoratedDocument, DocumentCategoryMetadata } from '../../../../@types/documents'
import { documentCategories } from './documentCategories'
import { missingNotRequiredDocsList, requiredDocsList } from './index'

export const decorateDocs = ({
  docs,
  nomsNumber,
  recallId,
}: {
  docs: ApiRecallDocument[]
  nomsNumber: string
  recallId: string
}): {
  documents: DecoratedDocument[]
  documentCategories: DocumentCategoryMetadata[]
  requiredDocsMissing: DocumentCategoryMetadata[]
  missingNotRequiredDocs: DocumentCategoryMetadata[]
  recallNotificationEmail?: DecoratedDocument
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
  const decoratedDocTypes = documentCategories
    .filter(doc => doc.type === 'document')
    .map(docType => {
      const uploadedDocs = decoratedUploadedDocs.filter(d => d.name === docType.name)
      return {
        ...docType,
        uploaded: uploadedDocs.map(d => ({ url: d.url, fileName: d.fileName, documentId: d.documentId })),
      }
    })
  return decoratedUploadedDocs.reduce(
    (acc, curr) => {
      if (curr.type === 'document') {
        acc.documents.push(curr)
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
    }
  )
}
