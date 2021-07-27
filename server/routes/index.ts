import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { findOffender } from './handlers/findOffender'
import getRevocationOrder from './handlers/getRevocationOrder'
import { createRecall } from './handlers/createRecall'
import { personProfile } from './handlers/personProfile'
import { recallList } from './handlers/recallList'
import { assessRecall } from './handlers/assessRecall'
import { newRecall } from './handlers/new-recall/newRecall'
import { recallType } from './handlers/new-recall/recallType'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', recallList)
  get('/find-person', findOffender)
  get('/persons/:nomsNumber', personProfile)
  post('/persons/:nomsNumber/recalls', createRecall)
  get('/persons/:nomsNumber/recalls/:recallId', newRecall)
  get('/persons/:nomsNumber/recalls/:recallId/recall-type', recallType)

  get('/assess-recall', assessRecall)
  get('/get-revocation-order', getRevocationOrder())

  return router
}
