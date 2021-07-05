import type { RequestHandler } from 'express'
import { createRecall } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../logger'

export default function createRecallHandler(): RequestHandler {
  return async (req, res, next) => {
    const { nomsNumber } = req.body
    try {
      const recallId = await createRecall(nomsNumber, res.locals.user.token)
      res.redirect(303, `/offender-profile?nomsNumber=${nomsNumber}&recallId=${recallId.uuid}`)
    } catch (err) {
      logger.error(err)
      res.redirect(303, `/offender-profile?nomsNumber=${nomsNumber}`)
    }
  }
}
