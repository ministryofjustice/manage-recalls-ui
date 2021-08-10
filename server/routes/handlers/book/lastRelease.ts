import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid, makeErrorObject, validateDate } from '../helpers'

export const lastRelease = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    return res.redirect(303, `/persons/${nomsNumber}`)
  }
  const { lastReleasePrison, year, month, day } = req.body
  const date = validateDate({ year, month, day })
  if (!date || !lastReleasePrison) {
    req.session.errors = []
    if (!lastReleasePrison) {
      req.session.errors.push(
        makeErrorObject({
          id: 'lastReleasePrison',
          text: 'Releasing prison',
          values: { lastReleasePrison },
        })
      )
    }
    if (!date) {
      req.session.errors.push(
        makeErrorObject({
          id: 'lastReleaseDateTime',
          text: 'Date and time you received the recall email',
          values: { year, month, day },
        })
      )
    }
  }
  if (req.session.errors) {
    return res.redirect(303, req.originalUrl)
  }
  try {
    const recall = await updateRecall(recallId, { lastReleaseDateTime: date.toISOString() }, res.locals.user.token)
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/upload-documents`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
