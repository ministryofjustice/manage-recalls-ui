import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import {
  decorateMissingDocumentsRecords,
  documentDownloadUrl,
  findCategoryInMissingDocumentsRecords,
  generatedDocMetaData,
} from '../../documents/download/helpers'
import { PersonAndRecallResponse } from '../../../../@types'
import { DecoratedGeneratedDoc } from '../../../../@types/documents'

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
  personAndRecall,
}: {
  sortedHistory: RecallDocument[]
  personAndRecall: PersonAndRecallResponse
}): DecoratedGeneratedDoc[] => {
  const { person, recall } = personAndRecall
  const { recallId, nomsNumber, bookingNumber } = recall
  const { firstName, lastName } = person
  return sortedHistory.map((document: RecallDocument) =>
    generatedDocMetaData({
      recallId,
      nomsNumber,
      document,
      firstName,
      lastName,
      bookingNumber,
    })
  )
}
