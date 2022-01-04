import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { MissingDocumentsRecord } from '../../../../../@types/manage-recalls-api/models/MissingDocumentsRecord'
import { missingNotRequiredDocsList, requiredDocsList, uploadedDocCategoriesList } from '../../upload/helpers'
import { decorateMissingDocumentsRecords, generatedDocMetaData, getDocHistoryStatus } from './index'
import { decorateAllDocTypes } from './decorateAllDocTypes'
import { getVersionedUpload } from './getVersionedUpload'
import { DocumentDecorations } from '../../../../../@types/documents'

export const decorateDocs = ({
  docs,
  missingDocumentsRecords = [],
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
  const decoratedDocs = decorateAllDocTypes({ docs, nomsNumber, recallId })
  const docCategoriesWithUploads = uploadedDocCategoriesList().map(docType => ({
    ...docType,
    uploaded: decoratedDocs.filter(d => d.suggestedCategory === docType.name),
  }))
  const versionedUpload = getVersionedUpload({ versionedCategoryName, docCategoriesWithUploads })
  const decoratedMissingDocumentsRecords = decorateMissingDocumentsRecords({
    missingDocumentsRecords,
    nomsNumber,
    recallId,
  })
  return decoratedDocs.reduce(
    (acc, doc) => {
      if (doc.type === 'document') {
        acc.documentsUploaded.push({ ...doc, hasHistory: getDocHistoryStatus({ doc, missingDocumentsRecords }) })
      }
      if (doc.type === 'generated') {
        acc.documentsGenerated[doc.category] = generatedDocMetaData({
          document: doc,
          firstName,
          lastName,
          bookingNumber,
          recallId,
          nomsNumber,
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
      missingDocumentsRecords: decoratedMissingDocumentsRecords,
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
