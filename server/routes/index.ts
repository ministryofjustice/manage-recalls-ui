import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { findPerson } from './handlers/findPerson'
import getRevocationOrder from './handlers/assess/getRevocationOrder'
import { createRecall } from './handlers/book/createRecall'
import { recallList } from './handlers/recallList'
import { assessDecisionFormHandler } from './handlers/assess/assessDecision'
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
import { assessPrisonFormHandler } from './handlers/assess/assessPrison'
import { assessLicenceFormHandler } from './handlers/assess/assessLicence'
import { dossierLetterFormHandler } from './handlers/dossier/dossierLetter'
import { assessEmailFormHandler } from './handlers/assess/assessEmail'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', recallList)
  get('/find-person', findPerson)

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
  get('/persons/:nomsNumber/recalls/:recallId/confirmation', viewWithRecallAndPerson('recallConfirmation'))

  // ASSESS A RECALL
  get('/persons/:nomsNumber/recalls/:recallId/assess', viewWithRecallAndPerson('assessRecall'))
  get('/persons/:nomsNumber/recalls/:recallId/assess-decision', viewWithRecallAndPerson('assessDecision'))
  post('/persons/:nomsNumber/recalls/:recallId/assess-decision', assessDecisionFormHandler)
  get('/persons/:nomsNumber/recalls/:recallId/assess-prison', viewWithRecallAndPerson('assessPrison'))
  post('/persons/:nomsNumber/recalls/:recallId/assess-prison', assessPrisonFormHandler)
  get('/persons/:nomsNumber/recalls/:recallId/assess-licence', viewWithRecallAndPerson('assessLicence'))
  post('/persons/:nomsNumber/recalls/:recallId/assess-licence', assessLicenceFormHandler)
  get('/persons/:nomsNumber/recalls/:recallId/assess-email', viewWithRecallAndPerson('assessEmail'))
  post('/persons/:nomsNumber/recalls/:recallId/assess-email', assessEmailFormHandler)
  get('/persons/:nomsNumber/recalls/:recallId/assess-confirmation', viewWithRecallAndPerson('assessConfirmation'))
  get('/persons/:nomsNumber/recalls/:recallId/documents/:documentId', downloadDocument)

  // CREATE DOSSIER
  get('/persons/:nomsNumber/recalls/:recallId/dossier-letter', viewWithRecallAndPerson('dossierLetter'))
  post('/persons/:nomsNumber/recalls/:recallId/dossier-letter', dossierLetterFormHandler)
  get('/persons/:nomsNumber/recalls/:recallId/dossier-confirmation', viewWithRecallAndPerson('dossierConfirmation'))

  get('/get-revocation-order', getRevocationOrder())

  return router
}
