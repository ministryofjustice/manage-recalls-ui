import type { RequestHandler } from 'express'
import logger from '../../../logger'
import { searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'

export default function prisonerSearchHandler(): RequestHandler {
  return async (req, res, next) => {
    const { nomsNumber } = req.body

    if (isValid(nomsNumber)) {
      const prisoners = await searchByNomsNumber(nomsNumber, res.locals.user.token)
      logger.info(`Found prisoners: ${prisoners.length}`)
      res.locals.prisoners = prisoners
      res.render('pages/index')
    } else {
      res.send(400)
    }
  }
}

const isValid = (nomsNumber: string) => nomsNumber && nomsNumber !== ''
