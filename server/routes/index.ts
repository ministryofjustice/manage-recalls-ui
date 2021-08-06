import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { findPerson } from './handlers/findPerson'
import getRevocationOrder from './handlers/assess/getRevocationOrder'
import { createRecall } from './handlers/book/createRecall'
import { personProfile } from './handlers/personProfile'
import { recallList } from './handlers/recallList'
import { assessDecisionFormHandler } from './handlers/assess/assessRecall'
import {
  uploadDocumentsPage,
  uploadRecallDocumentsFormHandler,
  downloadDocument,
} from './handlers/book/uploadRecallDocuments'
import { recallRequestReceivedFormHandler } from './handlers/book/recallRequestReceived'
import { addRecallType } from './handlers/book/addRecallType'
import { viewWithRecallAndPerson } from './handlers/helpers/viewWithRecallAndPerson'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', recallList)
  get('/find-person', findPerson)
  get('/persons/:nomsNumber', personProfile)

  // BOOK A RECALL
  post('/persons/:nomsNumber/recalls', createRecall)
  get('/persons/:nomsNumber/recalls/:recallId/request-received', viewWithRecallAndPerson('recallRequestReceived'))
  post('/persons/:nomsNumber/recalls/:recallId/request-received', recallRequestReceivedFormHandler)
  get('/persons/:nomsNumber/recalls/:recallId/recall-type', viewWithRecallAndPerson('recallType'))
  post('/persons/:nomsNumber/recalls/:recallId/recall-type', addRecallType)
  get('/persons/:nomsNumber/recalls/:recallId/upload-documents', uploadDocumentsPage)
  post('/persons/:nomsNumber/recalls/:recallId/upload-documents', uploadRecallDocumentsFormHandler)

  // ASSESS A RECALL
  get('/persons/:nomsNumber/recalls/:recallId/assess', viewWithRecallAndPerson('assessRecall'))
  get('/persons/:nomsNumber/recalls/:recallId/assess-decision', viewWithRecallAndPerson('assessDecision'))
  post('/persons/:nomsNumber/recalls/:recallId/assess-decision', assessDecisionFormHandler)
  get('/persons/:nomsNumber/recalls/:recallId/assess-confirmation', viewWithRecallAndPerson('assessConfirmation'))
  get('/persons/:nomsNumber/recalls/:recallId/documents/:documentId', downloadDocument)

  get('/get-revocation-order', getRevocationOrder())

  return router
}
