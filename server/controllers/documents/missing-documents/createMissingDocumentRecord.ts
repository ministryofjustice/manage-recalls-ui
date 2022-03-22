import superagent from 'superagent'
import { addMissingDocumentRecord, assignUserToRecall, getRecall } from '../../../clients/manageRecallsApiClient'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'
import { listMissingRequiredDocs } from '../upload/helpers'
import { SaveToApiFnArgs } from '../../../@types'

export const createMissingDocumentRecord = async ({
  recallId,
  valuesToSave,
  user,
}: SaveToApiFnArgs): Promise<superagent.Response> => {
  const recall = await getRecall(recallId, user.token)
  const missingDocumentCategories = listMissingRequiredDocs({
    recall,
    returnLabels: false,
  }) as RecallDocument.category[]
  const response = await addMissingDocumentRecord(
    {
      categories: missingDocumentCategories,
      recallId,
      details: valuesToSave.missingDocumentsDetail as string,
      emailFileName: valuesToSave.fileName as string,
      emailFileContent: valuesToSave.fileContent as string,
    },
    user.token
  )
  if (missingDocumentCategories.includes(RecallDocument.category.PART_B_RISK_REPORT)) {
    await assignUserToRecall(recallId, user.uuid, user.token)
  }
  return response
}
