import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid, makeErrorObject, convertGmtDatePartsToUtc } from '../helpers'

export const recallRequestReceivedFormHandler = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    return res.redirect(303, `/persons/${nomsNumber}`)
  }
  const { year, month, day, hour, minute } = req.body
  const recallEmailReceivedDateTime = convertGmtDatePartsToUtc({ year, month, day, hour, minute })
  if (!recallEmailReceivedDateTime) {
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
    const recall = await updateRecall(recallId, { recallEmailReceivedDateTime }, res.locals.user.token)
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/last-release`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
