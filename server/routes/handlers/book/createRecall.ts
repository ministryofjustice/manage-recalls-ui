import { Request, Response } from 'express'
import { createRecall as createRecallApi } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'

export const createRecall = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber } = req.params
  if (!nomsNumber) {
    res.sendStatus(400)
    return
  }
  const { user } = res.locals
  try {
    const recall = await createRecallApi(nomsNumber, user.uuid, user.token)
    if (!recall.recallId) {
      throw new Error("Created recall didn't return a recallId")
    }
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/pre-cons-name`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
