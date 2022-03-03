import { SaveToApiFnArgs } from '../../../../@types'
import { unassignUserFromRecall, updateRecall } from '../../../../clients/manageRecallsApiClient'
import { isInCustody } from '../../../utils/recallStatus'
import logger from '../../../../../logger'

export const saveRecallAndUnassignUser = async ({ recallId, valuesToSave, user }: SaveToApiFnArgs) => {
  const recall = await updateRecall(recallId, valuesToSave, user.token)
  if (isInCustody(recall) === true) {
    try {
      await unassignUserFromRecall(recallId, user.uuid, user.token)
    } catch (e) {
      logger.error(`User ${user.uuid} could not be unassigned from recall ${recallId}`)
    }
  }
}
