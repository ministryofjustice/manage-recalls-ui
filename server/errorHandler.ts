import type { Request, Response, NextFunction } from 'express'
import type { HTTPError } from 'superagent'
import logger from '../logger'

export default function createErrorHandler(production: boolean) {
  return (error: HTTPError, req: Request, res: Response, next: NextFunction): void => {
    logger.error(`Error handling request for '${req.originalUrl}`, error)

    if (error.status === 401 || error.status === 403) {
      logger.info('Logging user out')
      return res.redirect('/logout')
    }

    if (error.status === 404) {
      return res.status(404).render('pages/error-404')
    }
    res.locals.production = production
    if (!production) {
      res.locals.message = error.message
      res.locals.status = error.status
      res.locals.stack = error.stack
    }

    res.status(error.status || 500)

    return res.render('pages/error')
  }
}
