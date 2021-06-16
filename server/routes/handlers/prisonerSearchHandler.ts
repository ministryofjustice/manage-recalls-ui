import type { RequestHandler } from 'express'
import logger from '../../../logger'
import searchByNomisNumber from '../../data/manageRecallsApi/manageRecallsApiClient'

export default function prisonerSearchHandler(): RequestHandler {
  return async (req, res, next) => {
    const { nomisNumber } = req.body

    if (isValid(nomisNumber)) {
      const prisoners = await searchByNomisNumber(nomisNumber, res.locals.user.token)
      logger.info(`Found prisoners: ${prisoners.length}`)
      res.locals.prisoners = prisoners
      res.render('pages/index')
    } else {
      res.send(400)
    }
  }
}

const isValid = (nomisNumber: string) => nomisNumber && nomisNumber !== ''
