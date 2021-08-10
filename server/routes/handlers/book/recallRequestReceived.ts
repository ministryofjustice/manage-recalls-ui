import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid, makeErrorObject, parseDate } from '../helpers'

export const recallRequestReceivedFormHandler = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    return res.redirect(303, `/persons/${nomsNumber}`)
  }
  const { year, month, day, hour, minute } = req.body
  const date = parseDate({ year, month, day, hour, minute })
  if (!date) {
    req.session.errors = [
      makeErrorObject({
        id: 'recallEmailReceivedDateTime',
        text: 'Date and time you received the recall email',
        values: { year, month, day, hour, minute },
      }),
    ]
    return res.redirect(303, req.originalUrl)
  }
  try {
    const recall = await updateRecall(
      recallId,
      { recallEmailReceivedDateTime: date.toISOString() },
      res.locals.user.token
    )
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/recall-type`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
