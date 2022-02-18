import { unassignUserFromRecall, updateRecall } from '../../../clients/manageRecallsApiClient'
import { SaveToApiFnArgs } from '../../recallFormPost'

export const saveWarrantReference = async ({ recallId, valuesToSave, user }: SaveToApiFnArgs) => {
  await updateRecall(recallId, valuesToSave, user.token)
  await unassignUserFromRecall(recallId, user.uuid, user.token)
}
