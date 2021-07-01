import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import prisonerSearchHandler from './handlers/prisonerSearchHandler'
import generateRevocationOrderHandler from './handlers/generateRevocationOrderHandler'
import createRecallHandler from './handlers/createRecallHandler'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', (req, res, next) => {
    res.render('pages/index')
  })
  post('/', prisonerSearchHandler())
  get('/generate-revocation-order', generateRevocationOrderHandler())
  post('/create-recall', createRecallHandler())
  get('/recall-confirmation', (req, res, next) => {
    res.render('pages/recallConfirmation')
  })
  return router
}
