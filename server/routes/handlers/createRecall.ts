import { Request, Response } from 'express'
import { createRecall as createRecallApi } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../logger'

export const createRecall = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber } = req.params
  if (!nomsNumber) {
    res.sendStatus(400)
    return
  }
  try {
    const recall = await createRecallApi(nomsNumber, res.locals.user.token)
    if (!recall.recallId) {
      throw new Error("Created recall didn't return a recallId")
    }
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
