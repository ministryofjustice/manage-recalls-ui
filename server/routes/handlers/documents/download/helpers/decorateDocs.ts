import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { MissingDocumentsRecord } from '../../../../../@types/manage-recalls-api/models/MissingDocumentsRecord'
import { missingNotRequiredDocsList, requiredDocsList, uploadedDocCategoriesList } from '../../upload/helpers'
import {
  decorateMissingDocumentsRecords,
  decorateRescindRecords,
  generatedDocMetaData,
  getDocHistoryStatus,
} from './index'
import { decorateAllDocTypes } from './decorateAllDocTypes'
import { getVersionedUpload } from './getVersionedUpload'
import { DocumentDecorations } from '../../../../../@types/documents'
import { isInCustody } from '../../../helpers/recallStatus'
import { RecallResponse } from '../../../../../@types/manage-recalls-api'
import { RescindRecord } from '../../../../../@types/manage-recalls-api/models/RescindRecord'

export const decorateDocs = ({
  docs,
  missingDocumentsRecords = [],
  rescindRecords,
  versionedCategoryName,
  recall,
}: {
  docs: RecallDocument[]
  missingDocumentsRecords?: MissingDocumentsRecord[]
  rescindRecords?: RescindRecord[]
  versionedCategoryName?: string
  recall: RecallResponse
}): DocumentDecorations => {
  const { nomsNumber, recallId, bookingNumber, firstName, lastName } = recall
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
  const decoratedRescindRecords = decorateRescindRecords({ rescindRecords, recallId, nomsNumber })
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
      missingDocumentsRecords: decoratedMissingDocumentsRecords,
      rescindRecords: decoratedRescindRecords,
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
