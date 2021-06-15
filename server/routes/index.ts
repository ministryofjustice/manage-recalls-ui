import type { RequestHandler, Router } from 'express'
import logger from '../../logger'

import asyncMiddleware from '../middleware/asyncMiddleware'
import ManageRecallsApiClient from '../data/manageRecallsApi/manageRecallsApiClient'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index')
  })
  post('/', searchPrisoners())

  return router
}

const manageRecallsApiClient = new ManageRecallsApiClient()

function searchPrisoners(): RequestHandler {
  return async (req, res, next) => {
    const { nomisNumber } = req.body
    const prisoners = await manageRecallsApiClient.searchForPrisoner(nomisNumber, res.locals.user.token)
    logger.info(`Found prisoners: ${prisoners.length}`)
    res.locals.prisoners = prisoners
    res.render('pages/index')
  }
}
