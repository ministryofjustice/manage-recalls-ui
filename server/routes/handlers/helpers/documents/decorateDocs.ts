import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { DecoratedDocument } from '../../../../@types/documents'
import { documentCategories } from './documentCategories'
import {
  getGeneratedDocFileName,
  getGeneratedDocUrlPath,
  missingNotRequiredDocsList,
  requiredDocsList,
  uploadedDocCategoriesList,
} from './index'
import { MissingDocumentsRecord } from '../../../../@types/manage-recalls-api/models/MissingDocumentsRecord'
import { DocumentDecorations } from '../../../../@types'

export const decorateDocs = ({
  docs,
  missingDocumentsRecords,
  nomsNumber,
  recallId,
  firstName,
  lastName,
  bookingNumber,
  versionedCategoryName,
}: {
  docs: RecallDocument[]
  missingDocumentsRecords?: MissingDocumentsRecord[]
  nomsNumber: string
  recallId: string
  firstName?: string
  lastName?: string
  bookingNumber: string
  versionedCategoryName?: string
}): DocumentDecorations => {
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
        standardFileName: d.standardFileName,
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
      const { label, name, type, standardFileName } = categoryData
      const { version, url, documentId, category, createdDateTime, fileName } = categoryData.uploaded[0]
      versionedCategory = {
        label,
        name,
        standardFileName,
        fileName,
        type,
        version,
        url,
        documentId,
        category,
        createdDateTime,
      }
    }
  }
  return decoratedUploadedDocs.reduce(
    (acc, curr) => {
      if (curr.type === 'document') {
        acc.documentsUploaded.push(curr)
      }
      if (
        [
          RecallDocument.category.RECALL_NOTIFICATION,
          RecallDocument.category.REVOCATION_ORDER,
          RecallDocument.category.LETTER_TO_PRISON,
          RecallDocument.category.DOSSIER,
          RecallDocument.category.REASONS_FOR_RECALL,
        ].includes(curr.name)
      ) {
        acc.documentsGenerated[curr.name] = {
          ...curr,
          fileName: getGeneratedDocFileName({
            firstName,
            lastName,
            bookingNumber,
            docCategory: curr.name,
          }),
          url: getGeneratedDocUrlPath({
            recallId,
            nomsNumber,
            documentId: curr.documentId,
            docCategory: curr.name,
          }),
        }
      }
      if (
        [
          RecallDocument.category.RECALL_NOTIFICATION_EMAIL,
          RecallDocument.category.RECALL_REQUEST_EMAIL,
          RecallDocument.category.DOSSIER_EMAIL,
        ].includes(curr.name)
      ) {
        acc.emailsUploaded[curr.name] = curr
      }
      if (curr.name === RecallDocument.category.MISSING_DOCUMENTS_EMAIL) {
        acc.missingDocumentsRecord = {
          ...(missingDocumentsRecords ? missingDocumentsRecords[0] : {}),
          ...curr,
        }
      }
      return acc
    },
    {
      documentsUploaded: [],
      missingDocumentsRecord: undefined,
      documentCategories: decoratedDocTypes,
      requiredDocsMissing: requiredDocsList().filter(
        requiredDocCategory => !decoratedUploadedDocs.find(doc => doc.name === requiredDocCategory.name)
      ),
      missingNotRequiredDocs: missingNotRequiredDocsList().filter(
        requiredDocCategory => !decoratedUploadedDocs.find(doc => doc.name === requiredDocCategory.name)
      ),
      versionedCategory,
      documentsGenerated: {},
      emailsUploaded: {},
    }
  )
}
