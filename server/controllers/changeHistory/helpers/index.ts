import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'
import {
  decorateMissingDocumentsRecords,
  documentDownloadUrl,
  findCategoryInMissingDocumentsRecords,
  generatedDocMetaData,
} from '../../documents/download/helpers'
import { DecoratedGeneratedDoc } from '../../../@types/documents'
import { isInCustody } from '../../utils/recallStatus'

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
  const { recallId, nomsNumber } = recall
  const missingDocumentsRecords = decorateMissingDocumentsRecords({
    missingDocumentsRecords: findCategoryInMissingDocumentsRecords(
      recall.missingDocumentsRecords,
      category as RecallDocument.category
    ),
    nomsNumber,
    recallId,
  }).map(record => ({ ...record, isMissingRecord: true }))
  const decoratedHistory = sortedHistory.map((document: RecallDocument) => ({
    ...document,
    fileName: standardFileName || document.fileName,
    url: documentDownloadUrl({ recallId, nomsNumber, documentId: document.documentId }),
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
  const { recallId, nomsNumber, bookingNumber, firstName, lastName } = recall
  return sortedHistory.map((document: RecallDocument) =>
    generatedDocMetaData({
      recallId,
      nomsNumber,
      document,
      firstName,
      lastName,
      bookingNumber,
      inCustody: isInCustody(recall),
    })
  )
}
