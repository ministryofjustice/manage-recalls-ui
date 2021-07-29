import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { findOffender } from './handlers/findOffender'
import getRevocationOrder from './handlers/getRevocationOrder'
import { createRecall } from './handlers/createRecall'
import { personProfile } from './handlers/personProfile'
import { recallList } from './handlers/recallList'
import { assessRecall } from './handlers/assessRecall'
import {
  uploadDocumentsPage,
  uploadRecallDocumentsFormHandler,
  downloadDocument,
} from './handlers/new-recall/uploadRecallDocuments'
import { newRecall } from './handlers/new-recall/newRecall'
import { recallType } from './handlers/new-recall/recallType'
import { addRecallType } from './handlers/new-recall/addRecallType'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', recallList)
  get('/find-person', findOffender)
  get('/persons/:nomsNumber', personProfile)
  post('/persons/:nomsNumber/recalls', createRecall)
  get('/persons/:nomsNumber/recalls/:recallId', newRecall)
  get('/persons/:nomsNumber/recalls/:recallId/recall-type', recallType)
  post('/persons/:nomsNumber/recalls/:recallId/recall-type', addRecallType)
  get('/persons/:nomsNumber/recalls/:recallId/upload-documents', uploadDocumentsPage)
  post('/persons/:nomsNumber/recalls/:recallId/upload-documents', uploadRecallDocumentsFormHandler)
  get('/persons/:nomsNumber/recalls/:recallId/documents/:documentId', downloadDocument)

  get('/persons/:nomsNumber/recalls/:recallId/assess', assessRecall)
  get('/get-revocation-order', getRevocationOrder())

  return router
}
