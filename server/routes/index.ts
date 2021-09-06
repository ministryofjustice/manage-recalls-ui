import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { findPerson } from './handlers/findPerson'
import getRevocationOrder from './handlers/assess/getRevocationOrder'
import { createRecall } from './handlers/book/createRecall'
import { recallList } from './handlers/recallList'
import {
  uploadDocumentsPage,
  uploadRecallDocumentsFormHandler,
  downloadDocument,
} from './handlers/book/recallUploadDocuments'
import { viewWithRecallAndPerson } from './handlers/helpers/viewWithRecallAndPerson'
import { assessEmailFormHandler } from './handlers/assess/assessEmail'
import { handleRecallFormPost } from './handlers/helpers/handleRecallFormPost'
import { validateDecision } from './handlers/assess/helpers/validateDecision'
import { validateDossierLetter } from './handlers/dossier/helpers/validateDossierLetter'
import { validateLicence } from './handlers/assess/helpers/validateLicence'
import { validatePrison } from './handlers/assess/helpers/validatePrison'
import { validateRecallRequestReceived } from './handlers/book/helpers/validateRecallRequestReceived'
import { validateSentenceDetails } from './handlers/book/helpers/validateSentenceDetails'
import { validatePolice } from './handlers/book/helpers/validatePolice'
import { validateIssuesNeeds } from './handlers/book/helpers/validateIssuesNeeds'
import { validateProbationOfficer } from './handlers/book/helpers/validateProbationOfficer'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', recallList)
  get('/find-person', findPerson)

  // BOOK A RECALL
  post('/persons/:nomsNumber/recalls', createRecall)

  const basePath = '/persons/:nomsNumber/recalls/:recallId'

  get(`${basePath}/request-received`, viewWithRecallAndPerson('recallRequestReceived'))
  post(`${basePath}/request-received`, handleRecallFormPost(validateRecallRequestReceived, 'last-release'))
  get(`${basePath}/last-release`, viewWithRecallAndPerson('recallSentenceDetails'))
  post(`${basePath}/last-release`, handleRecallFormPost(validateSentenceDetails, 'prison-police'))
  get(`${basePath}/prison-police`, viewWithRecallAndPerson('recallPrisonPolice'))
  post(`${basePath}/prison-police`, handleRecallFormPost(validatePolice, 'issues-needs'))
  get(`${basePath}/issues-needs`, viewWithRecallAndPerson('recallIssuesNeeds'))
  post(`${basePath}/issues-needs`, handleRecallFormPost(validateIssuesNeeds, 'probation-officer'))
  get(`${basePath}/probation-officer`, viewWithRecallAndPerson('recallProbationOfficer'))
  post(`${basePath}/probation-officer`, handleRecallFormPost(validateProbationOfficer, 'upload-documents'))
  get(`${basePath}/upload-documents`, uploadDocumentsPage)
  post(`${basePath}/upload-documents`, uploadRecallDocumentsFormHandler)
  get(`${basePath}/confirmation`, viewWithRecallAndPerson('recallConfirmation'))

  // ASSESS A RECALL
  get(`${basePath}/assess`, viewWithRecallAndPerson('assessRecall'))
  get(`${basePath}/assess-decision`, viewWithRecallAndPerson('assessDecision'))
  post(`${basePath}/assess-decision`, handleRecallFormPost(validateDecision, 'assess-licence'))
  get(`${basePath}/assess-prison`, viewWithRecallAndPerson('assessPrison'))
  post(`${basePath}/assess-prison`, handleRecallFormPost(validatePrison, 'assess-email'))
  get(`${basePath}/assess-licence`, viewWithRecallAndPerson('assessLicence'))
  post(`${basePath}/assess-licence`, handleRecallFormPost(validateLicence, 'assess-prison'))
  get(`${basePath}/assess-email`, viewWithRecallAndPerson('assessEmail'))
  post(`${basePath}/assess-email`, assessEmailFormHandler)
  get(`${basePath}/assess-confirmation`, viewWithRecallAndPerson('assessConfirmation'))
  get(`${basePath}/documents/:documentId`, downloadDocument)

  get('/get-revocation-order', getRevocationOrder())

  // CREATE DOSSIER
  get(`${basePath}/dossier-letter`, viewWithRecallAndPerson('dossierLetter'))
  post(`${basePath}/dossier-letter`, handleRecallFormPost(validateDossierLetter, 'dossier-download'))
  get(`${basePath}/dossier-download`, viewWithRecallAndPerson('dossierDownload'))
  get(`${basePath}/dossier-confirmation`, viewWithRecallAndPerson('dossierConfirmation'))

  return router
}
