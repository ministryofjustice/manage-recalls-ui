import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { makeErrorObject } from '../helpers'

export const dossierLetterFormHandler = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (!nomsNumber || !recallId) {
    logger.error(`nomsNumber or recallId not supplied. URL: ${req.originalUrl}`)
    res.sendStatus(400)
    return
  }
  try {
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recallId}/dossier-confirmation`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
