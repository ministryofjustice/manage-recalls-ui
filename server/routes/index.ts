import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { findOffender } from './handlers/findOffender'
import getRevocationOrder from './handlers/assess/getRevocationOrder'
import { createRecall } from './handlers/book/createRecall'
import { personProfile } from './handlers/personProfile'
import { recallList } from './handlers/recallList'
import { assessRecallView, assessDecisionFormHandler } from './handlers/assess/assessRecall'
import {
  uploadDocumentsPage,
  uploadRecallDocumentsFormHandler,
  downloadDocument,
} from './handlers/book/uploadRecallDocuments'
import { newRecall } from './handlers/book/newRecall'
import { recallType } from './handlers/book/recallType'
import { addRecallType } from './handlers/book/addRecallType'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', recallList)
  get('/find-person', findOffender)
  get('/persons/:nomsNumber', personProfile)

  // BOOK A RECALL
  post('/persons/:nomsNumber/recalls', createRecall)
  get('/persons/:nomsNumber/recalls/:recallId', newRecall)
  get('/persons/:nomsNumber/recalls/:recallId/recall-type', recallType)
  post('/persons/:nomsNumber/recalls/:recallId/recall-type', addRecallType)
  get('/persons/:nomsNumber/recalls/:recallId/upload-documents', uploadDocumentsPage)
  post('/persons/:nomsNumber/recalls/:recallId/upload-documents', uploadRecallDocumentsFormHandler)

  // ASSESS A RECALL
  get('/persons/:nomsNumber/recalls/:recallId/assess', assessRecallView('assessRecall'))
  get('/persons/:nomsNumber/recalls/:recallId/assess-decision', assessRecallView('assessDecision'))
  post('/persons/:nomsNumber/recalls/:recallId/assess-decision', assessDecisionFormHandler)
  get('/persons/:nomsNumber/recalls/:recallId/assess-confirmation', assessRecallView('assessConfirmation'))
  get('/persons/:nomsNumber/recalls/:recallId/documents/:documentId', downloadDocument)

  get('/get-revocation-order', getRevocationOrder())

  return router
}
