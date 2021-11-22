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
  versionedCategoryName,
}: {
  docs: ApiRecallDocument[]
  nomsNumber: string
  recallId: string
  firstName?: string
  lastName?: string
  bookingNumber: string
  versionedCategoryName?: string
}): {
  documents: DecoratedDocument[]
  appGeneratedDocuments: DecoratedDocument[]
  documentCategories: DocumentCategoryMetadata[]
  requiredDocsMissing: DocumentCategoryMetadata[]
  missingNotRequiredDocs: DocumentCategoryMetadata[]
  recallNotificationEmail?: DecoratedDocument
  recallNotification?: DecoratedDocument
  revocationOrder?: DecoratedDocument
  dossier?: DecoratedDocument
  letterToPrison?: DecoratedDocument
  reasonsForRecallDoc?: string
  recallRequestEmail?: DecoratedDocument
  dossierEmail?: DecoratedDocument
  versionedCategory?: DecoratedDocument
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
      uploaded: uploadedDocs.map(d => ({
        url: d.url,
        fileName: d.fileName,
        documentId: d.documentId,
        index: d.index,
        version: d.version,
        createdDateTime: d.createdDateTime,
        category: d.category,
      })),
    }
  })
  let versionedCategory: DecoratedDocument
  if (versionedCategoryName) {
    const categoryData = decoratedDocTypes.find(type => type.name === versionedCategoryName && type.versioned)
    if (categoryData && categoryData.uploaded.length) {
      const { label, name, type } = categoryData
      const { version, url, documentId, category, createdDateTime } = categoryData.uploaded[0]
      versionedCategory = { label, name, type, version, url, documentId, category, createdDateTime }
    }
  }
  const personName = formatPersonName({ firstName, lastName })
  const formattedBookingNumber = formatBookingNumber(bookingNumber)
  return decoratedUploadedDocs.reduce(
    (acc, curr) => {
      if (curr.type === 'document') {
        acc.documents.push(curr)
      }

      if (curr.name === ApiRecallDocument.category.RECALL_NOTIFICATION) {
        acc.recallNotification = {
          ...curr,
          label: `${personName}_${curr.name}.pdf`,
          url: `/persons/${nomsNumber}/recalls/${recallId}/documents/recall-notification`,
        }
      }

      if (curr.name === ApiRecallDocument.category.REVOCATION_ORDER) {
        acc.revocationOrder = {
          ...curr,
          label: `${personName}${formattedBookingNumber} REVOCATION ORDER.pdf`,
          url: `/persons/${nomsNumber}/recalls/${recallId}/documents/revocation-order/${curr.documentId}`,
        }
      }

      if (curr.name === ApiRecallDocument.category.LETTER_TO_PRISON) {
        acc.letterToPrison = {
          ...curr,
          label: `${personName}_${curr.name}.pdf`,
          url: `/persons/${nomsNumber}/recalls/${recallId}/documents/letter-to-prison`,
        }
      }

      if (curr.name === ApiRecallDocument.category.DOSSIER) {
        acc.dossier = {
          ...curr,
          label: `${personName}_${curr.name}.pdf`,
          url: `/persons/${nomsNumber}/recalls/${recallId}/documents/dossier`,
        }
      }

      if (curr.name === ApiRecallDocument.category.REASONS_FOR_RECALL) {
        acc.reasonsForRecallDoc = {
          ...curr,
          label: `${personName}_${curr.name}.pdf`,
          url: `/persons/${nomsNumber}/recalls/${recallId}/documents/reasons-for-recall/${curr.documentId}`,
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
      recallNotification: undefined,
      revocationOrder: undefined,
      versionedCategory,
      letterToPrison: undefined,
      dossier: undefined,
      reasonsForRecallDoc: undefined,
    }
  )
}
