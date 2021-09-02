import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { convertGmtDatePartsToUtc } from '../helpers/dates'
import { makeErrorObject } from '../helpers'

export const assessEmailFormHandler = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (!nomsNumber || !recallId) {
    logger.error(`nomsNumber or recallId not supplied. URL: ${req.originalUrl}`)
    res.sendStatus(400)
    return
  }
  try {
    const {
      confirmRecallNotificationEmailSent,
      recallNotificationEmailSentDateTimeYear,
      recallNotificationEmailSentDateTimeMonth,
      recallNotificationEmailSentDateTimeDay,
      recallNotificationEmailSentDateTimeHour,
      recallNotificationEmailSentDateTimeMinute,
    } = req.body
    const recallNotificationEmailSentDateTimeParts = {
      year: recallNotificationEmailSentDateTimeYear,
      month: recallNotificationEmailSentDateTimeMonth,
      day: recallNotificationEmailSentDateTimeDay,
      hour: recallNotificationEmailSentDateTimeHour,
      minute: recallNotificationEmailSentDateTimeMinute,
    }
    const recallNotificationEmailSentDateTime = convertGmtDatePartsToUtc(recallNotificationEmailSentDateTimeParts)
    if (!confirmRecallNotificationEmailSent || !recallNotificationEmailSentDateTime) {
      req.session.errors = []
      if (!confirmRecallNotificationEmailSent) {
        req.session.errors.push(
          makeErrorObject({
            id: 'confirmRecallNotificationEmailSent',
            text: 'Confirm you sent the email to all recipients',
          })
        )
      }
      if (confirmRecallNotificationEmailSent && !recallNotificationEmailSentDateTime) {
        req.session.errors.push(
          makeErrorObject({
            id: 'recallNotificationEmailSentDateTime',
            text: 'Date and time you received the recall email',
            values: recallNotificationEmailSentDateTimeParts,
          })
        )
      }
      req.session.unsavedValues = {
        confirmRecallNotificationEmailSent,
        recallNotificationEmailSentDateTimeParts,
      }
      return res.redirect(303, req.originalUrl)
    }
    const recall = await updateRecall(recallId, { recallNotificationEmailSentDateTime }, res.locals.user.token)
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/assess-confirmation`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
