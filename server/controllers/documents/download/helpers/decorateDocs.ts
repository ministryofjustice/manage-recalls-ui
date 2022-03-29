import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { uploadedDocCategoriesList } from '../../upload/helpers'
import { getDocHistoryStatus } from './index'
import { decorateAllDocTypes } from './decorateAllDocTypes'
import { getVersionedUpload } from './getVersionedUpload'
import { DocumentDecorations } from '../../../../@types/documents'
import { RecallResponse } from '../../../../@types/manage-recalls-api'
import { generatedDocMetaData } from '../../generated/helpers'

export const decorateDocs = ({
  docs,
  versionedCategoryName,
  recall,
}: {
  docs: RecallDocument[]
  versionedCategoryName?: string
  recall: RecallResponse
}): DocumentDecorations => {
  const { recallId, missingDocumentsRecords = [] } = recall
  const decoratedDocs = decorateAllDocTypes({ docs, recallId })
  const docCategoriesWithUploads = uploadedDocCategoriesList().map(docType => ({
    ...docType,
    uploaded: decoratedDocs.filter(d => d.suggestedCategory === docType.name),
  }))
  const versionedUpload = getVersionedUpload({ versionedCategoryName, docCategoriesWithUploads })
  return decoratedDocs.reduce(
    (acc, doc) => {
      if (doc.type === 'document') {
        acc.documentsUploaded.push({
          ...doc,
          hasHistory: getDocHistoryStatus({ doc, missingDocumentsRecords }),
        })
      }
      if (doc.type === 'generated') {
        acc.documentsGenerated[doc.category] = generatedDocMetaData({
          document: doc,
          recall,
        })
        if (versionedCategoryName === doc.category) {
          acc.versionedGeneratedDoc = {
            ...acc.documentsGenerated[doc.category],
          }
        }
      }
      if (doc.type === 'email') {
        acc.emailsUploaded[doc.category] = doc
      }
      return acc
    },
    {
      documentsUploaded: [],
      docCategoriesWithUploads,
      versionedUpload,
      versionedGeneratedDoc: undefined,
      documentsGenerated: {},
      emailsUploaded: {},
    }
  )
}
