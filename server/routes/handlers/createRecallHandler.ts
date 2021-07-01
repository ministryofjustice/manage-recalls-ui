import type { RequestHandler } from 'express'
import { createRecall, searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../logger'

export default function createRecallHandler(): RequestHandler {
  return async (req, res, next) => {
    console.log('CreateRecall')
    const { nomsNumber } = req.body
    const recallUniqueIdentifier = await createRecall(nomsNumber, res.locals.user.token)

    logger.info(`Received recall unique identifier: ${recallUniqueIdentifier}`)
    res.locals.recalUniqueIdentifier = recallUniqueIdentifier
    res.redirect('/recall-confirmation')
  }
}
