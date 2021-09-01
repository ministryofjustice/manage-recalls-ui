import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { makeErrorObject } from '../helpers'

export const assessPrisonFormHandler = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  const { currentPrison } = req.body
  if (!nomsNumber || !recallId) {
    logger.error(`nomsNumber or recallId not supplied. URL: ${req.originalUrl}`)
    res.sendStatus(400)
    return
  }
  if (!currentPrison) {
    req.session.errors = [
      makeErrorObject({
        id: 'currentPrison',
        text: 'Select a prison',
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }
  try {
    const recallNotificationEmailSentDateTime = new Date().toISOString()
    const recall = await updateRecall(
      recallId,
      { currentPrison, recallNotificationEmailSentDateTime },
      res.locals.user.token
    )
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/assess-confirmation`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
