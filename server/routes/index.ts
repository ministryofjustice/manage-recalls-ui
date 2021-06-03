import type { RequestHandler, Router } from 'express'
import logger from '../../logger'

import asyncMiddleware from '../middleware/asyncMiddleware'
import ManageRecallsApiClient from '../data/manageRecallsApiClient'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index')
  })
  get('/recall/search', (req, res, next) => {
    res.render('pages/recall-search')
  })
  post('/recall/search', searchPrisoners())

  return router
}

const manageRecallsApiClient = new ManageRecallsApiClient()

function searchPrisoners(): RequestHandler {
  return async (req, res, next) => {
    const { name } = req.body

    if (res.locals && res.locals.user && res.locals.user.token) {
      const prisoners = await manageRecallsApiClient.searchForPrisoner(name ?? 'Smith', res.locals.user.token)
      logger.info(`Found prisoners: ${JSON.stringify(prisoners)}`)
      res.locals.prisoners = prisoners
    }
    res.render('pages/recall-search')
  }
}
