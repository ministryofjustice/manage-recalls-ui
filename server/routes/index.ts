import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { findOffender } from './handlers/findOffender'
import generateRevocationOrder from './handlers/generateRevocationOrder'
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
  get('/generate-revocation-order', generateRevocationOrder())

  post('/create-recall', createRecall())

  return router
}
