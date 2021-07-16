import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { findOffender } from './handlers/findOffender'
import getRevocationOrder from './handlers/getRevocationOrder'
import createRecall from './handlers/createRecall'
import { offenderProfile } from './handlers/offenderProfile'
import { recallList } from './handlers/recallList'
import { assessRecall } from './handlers/assessRecall'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', recallList)
  get('/find-offender', findOffender)
  get('/offender-profile', offenderProfile)
  get('/assess-recall', assessRecall)
  get('/get-revocation-order', getRevocationOrder())

  post('/create-recall', createRecall())

  return router
}
