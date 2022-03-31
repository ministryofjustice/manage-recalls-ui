import { SaveToApiFnArgs } from '../../@types'
import { addPhaseEndTime, updateRecall } from '../../clients/manageRecallsApiClient'
import { isInCustody } from '../utils/recallStatus'
import logger from '../../../logger'
import { EndPhaseRequest } from '../../@types/manage-recalls-api'

export const endRecallPhase =
  (phase: EndPhaseRequest.phase) =>
  async ({ recallId, valuesToSave, user }: SaveToApiFnArgs) => {
    try {
      const recall = await updateRecall(recallId, valuesToSave, user.token)
      await addPhaseEndTime({ recallId, valuesToSave: { phase, shouldUnassign: isInCustody(recall) === true }, user })
    } catch (e) {
      logger.error(`Error updating recall or adding end ${phase} phase timing for recall ${recallId}: ${e.message}`)
    }
  }
