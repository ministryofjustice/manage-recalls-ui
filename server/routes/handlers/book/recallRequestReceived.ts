import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid, makeErrorObject, convertGmtDatePartsToUtc } from '../helpers'

export const recallRequestReceivedFormHandler = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    return res.redirect(303, `/persons/${nomsNumber}`)
  }
  const {
    recallEmailReceivedDateTimeYear,
    recallEmailReceivedDateTimeMonth,
    recallEmailReceivedDateTimeDay,
    recallEmailReceivedDateTimeHour,
    recallEmailReceivedDateTimeMinute,
  } = req.body
  const recallEmailReceivedDateTime = convertGmtDatePartsToUtc({
    year: recallEmailReceivedDateTimeYear,
    month: recallEmailReceivedDateTimeMonth,
    day: recallEmailReceivedDateTimeDay,
    hour: recallEmailReceivedDateTimeHour,
    minute: recallEmailReceivedDateTimeMinute,
  })
  if (!recallEmailReceivedDateTime) {
    req.session.errors = [
      makeErrorObject({
        id: 'recallEmailReceivedDateTime',
        text: 'Date and time you received the recall email',
        values: {
          year: recallEmailReceivedDateTimeYear,
          month: recallEmailReceivedDateTimeMonth,
          day: recallEmailReceivedDateTimeDay,
          hour: recallEmailReceivedDateTimeHour,
          minute: recallEmailReceivedDateTimeMinute,
        },
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
