import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'
import {
  decorateMissingDocumentsRecords,
  documentDownloadUrl,
  findCategoryInMissingDocumentsRecords,
} from '../../documents/download/helpers'
import { DecoratedGeneratedDoc } from '../../../@types/documents'
import { generatedDocMetaData } from '../../documents/generated/helpers'

export const uploaded = ({
  sortedHistory,
  recall,
  category,
  standardFileName,
}: {
  sortedHistory: RecallDocument[]
  recall: RecallResponse
  category: RecallDocument.category
  standardFileName: string
}) => {
  const { recallId } = recall
  const missingDocumentsRecords = decorateMissingDocumentsRecords({
    missingDocumentsRecords: findCategoryInMissingDocumentsRecords(
      recall.missingDocumentsRecords,
      category as RecallDocument.category
    ),
    recallId,
  }).map(record => ({ ...record, isMissingRecord: true }))
  const decoratedHistory = sortedHistory.map((document: RecallDocument) => ({
    ...document,
    fileName: standardFileName || document.fileName,
    url: documentDownloadUrl({ recallId, documentId: document.documentId }),
  }))
  return [...decoratedHistory, ...missingDocumentsRecords]
}

export const generated = ({
  sortedHistory,
  recall,
}: {
  sortedHistory: RecallDocument[]
  recall: RecallResponse
}): DecoratedGeneratedDoc[] => {
  return sortedHistory.map((document: RecallDocument) =>
    generatedDocMetaData({
      recall,
      document,
    })
  )
}
