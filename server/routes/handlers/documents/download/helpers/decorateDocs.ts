import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { MissingDocumentsRecord } from '../../../../../@types/manage-recalls-api/models/MissingDocumentsRecord'
import { missingNotRequiredDocsList, requiredDocsList, uploadedDocCategoriesList } from '../../upload/helpers'
import { generatedDocMetaData } from './index'
import { decorateAllDocTypes } from './decorateAllDocTypes'
import { getVersionedUpload } from './getVersionedUpload'
import { DocumentDecorations } from '../../../../../@types/documents'

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
  const decoratedDocs = decorateAllDocTypes({ docs, nomsNumber, recallId })
  const docCategoriesWithUploads = uploadedDocCategoriesList().map(docType => ({
    ...docType,
    uploaded: decoratedDocs.filter(d => d.suggestedCategory === docType.name),
  }))
  const versionedUpload = getVersionedUpload({ versionedCategoryName, docCategoriesWithUploads })

  return decoratedDocs.reduce(
    (acc, curr) => {
      if (curr.type === 'document') {
        acc.documentsUploaded.push(curr)
      }
      if (curr.type === 'generated') {
        acc.documentsGenerated[curr.category] = generatedDocMetaData({
          document: curr,
          firstName,
          lastName,
          bookingNumber,
          recallId,
          nomsNumber,
        })
        if (versionedCategoryName === curr.category) {
          acc.versionedGeneratedDoc = {
            ...acc.documentsGenerated[curr.category],
          }
        }
      }
      if (curr.type === 'email') {
        if (curr.category === RecallDocument.category.MISSING_DOCUMENTS_EMAIL) {
          acc.missingDocumentsRecord = {
            ...(missingDocumentsRecords ? missingDocumentsRecords[0] : {}),
            ...curr,
          }
        } else {
          acc.emailsUploaded[curr.category] = curr
        }
      }
      return acc
    },
    {
      documentsUploaded: [],
      missingDocumentsRecord: undefined,
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
