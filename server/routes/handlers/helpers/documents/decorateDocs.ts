import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { DecoratedDocument } from '../../../../@types/documents'
import { documentCategories } from './documentCategories'
import {
  getGeneratedDocFileName,
  getGeneratedDocUrlPath,
  missingNotRequiredDocsList,
  requiredDocsList,
  uploadedDocCategoriesList,
} from './index'
import { MissingDocumentsRecordResponse } from '../../../../@types/manage-recalls-api/models/MissingDocumentsRecordResponse'
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
  docs: ApiRecallDocument[]
  missingDocumentsRecords?: MissingDocumentsRecordResponse[]
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
  return decoratedUploadedDocs.reduce(
    (acc, curr) => {
      if (curr.type === 'document') {
        acc.documentsUploaded.push(curr)
      }
      if (
        [
          ApiRecallDocument.category.RECALL_NOTIFICATION,
          ApiRecallDocument.category.REVOCATION_ORDER,
          ApiRecallDocument.category.LETTER_TO_PRISON,
          ApiRecallDocument.category.DOSSIER,
          ApiRecallDocument.category.REASONS_FOR_RECALL,
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
          ApiRecallDocument.category.RECALL_NOTIFICATION_EMAIL,
          ApiRecallDocument.category.RECALL_REQUEST_EMAIL,
          ApiRecallDocument.category.DOSSIER_EMAIL,
        ].includes(curr.name)
      ) {
        acc.emailsUploaded[curr.name] = curr
      }
      if (curr.name === ApiRecallDocument.category.MISSING_DOCUMENTS_EMAIL) {
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
