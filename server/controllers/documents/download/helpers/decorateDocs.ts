import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { missingNotRequiredDocsList, requiredDocsList, uploadedDocCategoriesList } from '../../upload/helpers'
import { generatedDocMetaData, getDocHistoryStatus } from './index'
import { decorateAllDocTypes } from './decorateAllDocTypes'
import { getVersionedUpload } from './getVersionedUpload'
import { DocumentDecorations } from '../../../../@types/documents'
import { isInCustody } from '../../../utils/recallStatus'
import { RecallResponse } from '../../../../@types/manage-recalls-api'

export const decorateDocs = ({
  docs,
  versionedCategoryName,
  recall,
}: {
  docs: RecallDocument[]
  versionedCategoryName?: string
  recall: RecallResponse
}): DocumentDecorations => {
  const { nomsNumber, recallId, bookingNumber, firstName, lastName, missingDocumentsRecords = [] } = recall
  const decoratedDocs = decorateAllDocTypes({ docs, nomsNumber, recallId })
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
          firstName,
          lastName,
          bookingNumber,
          recallId,
          nomsNumber,
          inCustody: isInCustody(recall),
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
      requiredDocsMissing: requiredDocsList().filter(
        requiredDocCategory => !decoratedDocs.find(doc => doc.category === requiredDocCategory.name)
      ),
      missingNotRequiredDocs: missingNotRequiredDocsList().filter(
        requiredDocCategory => !decoratedDocs.find(doc => doc.category === requiredDocCategory.name)
      ),
      versionedUpload,
      versionedGeneratedDoc: undefined,
      documentsGenerated: {},
      emailsUploaded: {},
    }
  )
}
