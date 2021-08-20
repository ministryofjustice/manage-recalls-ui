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
import { sentenceDetails } from './handlers/book/sentenceDetails'
import { prisonPolice } from './handlers/book/prisonPolice'
import { viewWithRecallAndPerson } from './handlers/helpers/viewWithRecallAndPerson'
import { issuesNeeds } from './handlers/book/issuesNeeds'
import { probationOfficer } from './handlers/book/probationOfficer'

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
  get('/persons/:nomsNumber/recalls/:recallId/last-release', viewWithRecallAndPerson('recallSentenceDetails'))
  post('/persons/:nomsNumber/recalls/:recallId/last-release', sentenceDetails)
  get('/persons/:nomsNumber/recalls/:recallId/prison-police', viewWithRecallAndPerson('recallPrisonPolice'))
  post('/persons/:nomsNumber/recalls/:recallId/prison-police', prisonPolice)
  get('/persons/:nomsNumber/recalls/:recallId/issues-needs', viewWithRecallAndPerson('recallIssuesNeeds'))
  post('/persons/:nomsNumber/recalls/:recallId/issues-needs', issuesNeeds)
  get('/persons/:nomsNumber/recalls/:recallId/probation-officer', viewWithRecallAndPerson('recallProbationOfficer'))
  post('/persons/:nomsNumber/recalls/:recallId/probation-officer', probationOfficer)
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
