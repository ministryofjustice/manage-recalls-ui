import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid } from '../helpers'
import { validateSentenceDetails } from './helpers/validate-sentence-details'

export const sentenceDetails = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    return res.redirect(303, `/persons/${nomsNumber}`)
  }
  const { errors, validValues } = validateSentenceDetails(req.body)
  if (errors) {
    req.session.errors = errors
    return res.redirect(303, req.originalUrl)
  }
  try {
    const recall = await updateRecall(recallId, validValues, res.locals.user.token)
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/prison-police`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
