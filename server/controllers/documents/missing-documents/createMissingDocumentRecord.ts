import superagent from 'superagent'
import { addMissingDocumentRecord, getRecall } from '../../../clients/manageRecallsApiClient'
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
  return addMissingDocumentRecord(
    {
      categories: missingDocumentCategories,
      recallId,
      details: valuesToSave.missingDocumentsDetail as string,
      emailFileName: valuesToSave.fileName as string,
      emailFileContent: valuesToSave.fileContent as string,
    },
    user.token
  )
}
