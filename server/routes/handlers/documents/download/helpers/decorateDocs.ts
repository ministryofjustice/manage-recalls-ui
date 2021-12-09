import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { MissingDocumentsRecord } from '../../../../../@types/manage-recalls-api/models/MissingDocumentsRecord'
import { DecoratedDocument } from '../../../../../@types/documents'
import { DocumentDecorations } from '../../../../../@types'
import {
  findDocCategory,
  missingNotRequiredDocsList,
  requiredDocsList,
  uploadedDocCategoriesList,
} from '../../upload/helpers'
import { autocategoriseDocFileName } from './autocategorise'
import { getGeneratedDocFileName, getGeneratedDocUrlPath } from './index'
import { documentCategories } from '../../documentCategories'

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
  const categoryNamesForSorting = documentCategories.map(d => d.name)
  const decoratedUploadedDocs = docs
    .map(uploadedDoc => {
      const autocategory =
        uploadedDoc.category === RecallDocument.category.UNCATEGORISED &&
        autocategoriseDocFileName(uploadedDoc.fileName)
      const documentCategory = findDocCategory(uploadedDoc.category)
      let suggestedCategory
      if (documentCategory.type === 'document') {
        suggestedCategory = autocategory ? autocategory.name : documentCategory.name
      }
      return {
        ...uploadedDoc,
        type: documentCategory.type,
        standardFileName: documentCategory.standardFileName,
        label: documentCategory.label,
        labelLowerCase: documentCategory.labelLowerCase,
        category: documentCategory.name,
        suggestedCategory,
        url: `/persons/${nomsNumber}/recalls/${recallId}/documents/${uploadedDoc.documentId}`,
      }
    })
    .sort((a, b) => {
      const aIndex = categoryNamesForSorting.indexOf(a.category)
      const bIndex = categoryNamesForSorting.indexOf(b.category)
      if (aIndex > bIndex) {
        return 1
      }
      if (aIndex < bIndex) {
        return -1
      }
      return 0
    })
  const decoratedDocTypes = uploadedDocCategoriesList().map(docType => {
    const uploadedDocs = decoratedUploadedDocs.filter(d => d.suggestedCategory === docType.name)
    return {
      ...docType,
      uploaded: uploadedDocs.map(d => ({
        url: d.url,
        fileName: d.fileName,
        standardFileName: d.standardFileName,
        documentId: d.documentId,
        version: d.version,
        createdDateTime: d.createdDateTime,
        createdByUserName: d.createdByUserName,
        category: d.category,
        suggestedCategory: d.suggestedCategory,
      })),
    }
  })
  let versionedCategory: DecoratedDocument
  if (versionedCategoryName) {
    const categoryData = decoratedDocTypes.find(type => type.name === versionedCategoryName && type.versioned)
    if (categoryData && categoryData.uploaded.length) {
      const { label, type, standardFileName } = categoryData
      const { version, url, documentId, category, createdDateTime, createdByUserName, fileName } =
        categoryData.uploaded[0]
      versionedCategory = {
        label,
        standardFileName,
        fileName,
        type,
        version,
        url,
        documentId,
        category,
        createdDateTime,
        createdByUserName,
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
        ].includes(curr.category)
      ) {
        acc.documentsGenerated[curr.category] = {
          ...curr,
          fileName: getGeneratedDocFileName({
            firstName,
            lastName,
            bookingNumber,
            docCategory: curr.category,
          }),
          url: getGeneratedDocUrlPath({
            recallId,
            nomsNumber,
            documentId: curr.documentId,
            docCategory: curr.category,
          }),
        }
      }
      if (
        [
          RecallDocument.category.RECALL_NOTIFICATION_EMAIL,
          RecallDocument.category.RECALL_REQUEST_EMAIL,
          RecallDocument.category.DOSSIER_EMAIL,
        ].includes(curr.category)
      ) {
        acc.emailsUploaded[curr.category] = curr
      }
      if (curr.category === RecallDocument.category.MISSING_DOCUMENTS_EMAIL) {
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
        requiredDocCategory => !decoratedUploadedDocs.find(doc => doc.category === requiredDocCategory.name)
      ),
      missingNotRequiredDocs: missingNotRequiredDocsList().filter(
        requiredDocCategory => !decoratedUploadedDocs.find(doc => doc.category === requiredDocCategory.name)
      ),
      versionedCategory,
      documentsGenerated: {},
      emailsUploaded: {},
    }
  )
}
