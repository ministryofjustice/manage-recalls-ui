import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid } from './viewWithRecallAndPerson'

export const addRecallType = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  const { recommendedRecallLength } = req.body
  if (isInvalid(nomsNumber) || isInvalid(recallId) || isInvalid(recommendedRecallLength)) {
    res.sendStatus(400)
    return
  }

  try {
    const recall = await updateRecall(recallId, recommendedRecallLength, res.locals.user.token)
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/upload-documents`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
