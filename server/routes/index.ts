import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { findPerson } from './handlers/person/findPerson'
import { createRecall } from './handlers/book/createRecall'
import { recallList } from './handlers/recallList'
import { uploadRecallDocumentsFormHandler } from './handlers/book/recallUploadDocuments'
import { viewWithRecallAndPerson } from './handlers/helpers/viewWithRecallAndPerson'
import { emailUploadForm } from './handlers/helpers/emailUploadForm'
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
import {
  downloadDossier,
  downloadLetterToPrison,
  downloadReasonsForRecallOrder,
  downloadRecallNotification,
  downloadRevocationOrder,
} from './handlers/helpers/documents/downloadNamedPdfHandler'
import { validateRecallNotificationEmail } from './handlers/assess/helpers/validateRecallNotificationEmail'
import { AddDocumentRequest } from '../@types/manage-recalls-api/models/AddDocumentRequest'
import { validateDossierEmail } from './handlers/dossier/helpers/validateDossierEmail'
import { validatePreConsName } from './handlers/book/helpers/validatePreConsName'
import { validateDossierDownload } from './handlers/dossier/helpers/validateDossierDownload'
import { validateCheckAnswers } from './handlers/book/helpers/validateCheckAnswers'
import { getUser, postUser } from './handlers/user/userDetails'
import { parseUrlParams } from '../middleware/parseUrlParams'
import { fetchRemoteRefData } from '../referenceData'
import { assignUser } from './handlers/helpers/assignUser'
import { unassignUserFromRecall } from '../clients/manageRecallsApi/manageRecallsApiClient'
import { downloadUploadedDocumentOrEmail } from './handlers/helpers/documents/downloadUploadedDocumentOrEmail'
import { addMissingDocumentRecordForm } from './handlers/helpers/addMissingDocumentRecordForm'
import { validateLicenceName } from './handlers/book/helpers/validateLicenceName'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', recallList)
  get('/find-person', findPerson)

  post('/persons/:nomsNumber/recalls', createRecall)

  const basePath = '/persons/:nomsNumber/recalls/:recallId'

  router.use(`${basePath}/:pageSlug`, parseUrlParams, fetchRemoteRefData)

  // BOOK A RECALL
  get(`${basePath}/licence-name`, viewWithRecallAndPerson('recallLicenceName'))
  post(`${basePath}/licence-name`, handleRecallFormPost(validateLicenceName, 'pre-cons-name'))
  get(`${basePath}/pre-cons-name`, viewWithRecallAndPerson('recallPreConsName'))
  post(`${basePath}/pre-cons-name`, handleRecallFormPost(validatePreConsName, 'request-received'))
  get(`${basePath}/request-received`, viewWithRecallAndPerson('recallRequestReceived'))
  post(
    `${basePath}/request-received`,
    emailUploadForm({
      emailFieldName: 'recallRequestEmailFileName',
      validator: validateRecallRequestReceived,
      documentCategory: AddDocumentRequest.category.RECALL_REQUEST_EMAIL,
      nextPageUrlSuffix: 'last-release',
    })
  )
  get(`${basePath}/last-release`, viewWithRecallAndPerson('recallSentenceDetails'))
  post(`${basePath}/last-release`, handleRecallFormPost(validateSentenceDetails, 'prison-police'))
  get(`${basePath}/prison-police`, viewWithRecallAndPerson('recallPrisonPolice'))
  post(`${basePath}/prison-police`, handleRecallFormPost(validatePolice, 'issues-needs'))
  get(`${basePath}/issues-needs`, viewWithRecallAndPerson('recallIssuesNeeds'))
  post(`${basePath}/issues-needs`, handleRecallFormPost(validateIssuesNeeds, 'probation-officer'))
  get(`${basePath}/probation-officer`, viewWithRecallAndPerson('recallProbationOfficer'))
  post(`${basePath}/probation-officer`, handleRecallFormPost(validateProbationOfficer, 'upload-documents'))
  get(`${basePath}/upload-documents`, viewWithRecallAndPerson('recallDocuments'))
  post(`${basePath}/upload-documents`, uploadRecallDocumentsFormHandler)
  get(`${basePath}/missing-documents`, viewWithRecallAndPerson('recallMissingDocuments'))
  post(`${basePath}/missing-documents`, addMissingDocumentRecordForm)
  get(`${basePath}/upload-document-version`, viewWithRecallAndPerson('recallUploadDocumentVersion'))
  post(`${basePath}/upload-document-version`, uploadRecallDocumentsFormHandler)
  get(`${basePath}/check-answers`, viewWithRecallAndPerson('recallCheckAnswers'))
  post(`${basePath}/check-answers`, handleRecallFormPost(validateCheckAnswers, 'confirmation'))
  get(`${basePath}/confirmation`, viewWithRecallAndPerson('recallConfirmation'))

  // ASSESS A RECALL
  post(`${basePath}/assess-assign`, assignUser({ nextPageUrlSuffix: 'assess' }))
  get(`${basePath}/assess`, viewWithRecallAndPerson('assessRecall'))
  get(`${basePath}/assess-decision`, viewWithRecallAndPerson('assessDecision'))
  post(`${basePath}/assess-decision`, handleRecallFormPost(validateDecision, 'assess-licence'))
  get(`${basePath}/assess-stop`, viewWithRecallAndPerson('assessStop'))
  get(`${basePath}/assess-licence`, viewWithRecallAndPerson('assessLicence'))
  post(`${basePath}/assess-licence`, handleRecallFormPost(validateLicence, 'assess-prison'))
  get(`${basePath}/assess-prison`, viewWithRecallAndPerson('assessPrison'))
  post(`${basePath}/assess-prison`, handleRecallFormPost(validatePrison, 'assess-download'))
  get('/persons/:nomsNumber/recalls/:recallId/assess-download', viewWithRecallAndPerson('assessDownload'))
  get(`${basePath}/assess-email`, viewWithRecallAndPerson('assessEmail'))
  post(
    `${basePath}/assess-email`,
    emailUploadForm({
      emailFieldName: 'recallNotificationEmailFileName',
      validator: validateRecallNotificationEmail,
      unassignUserFromRecall,
      documentCategory: AddDocumentRequest.category.RECALL_NOTIFICATION_EMAIL,
      nextPageUrlSuffix: 'assess-confirmation',
    })
  )
  get(`${basePath}/assess-confirmation`, viewWithRecallAndPerson('assessConfirmation'))

  // CREATE DOSSIER
  post(`${basePath}/dossier-assign`, assignUser({ nextPageUrlSuffix: 'dossier-recall' }))
  get(`${basePath}/dossier-recall`, viewWithRecallAndPerson('dossierRecallInformation'))
  get(`${basePath}/dossier-letter`, viewWithRecallAndPerson('dossierLetter'))
  post(`${basePath}/dossier-letter`, handleRecallFormPost(validateDossierLetter, 'dossier-check'))
  get(`${basePath}/dossier-check`, viewWithRecallAndPerson('dossierCheck'))
  get(`${basePath}/dossier-download`, viewWithRecallAndPerson('dossierDownload'))
  post(`${basePath}/dossier-download`, handleRecallFormPost(validateDossierDownload, 'dossier-email'))
  get(`${basePath}/dossier-email`, viewWithRecallAndPerson('dossierEmail'))
  post(
    `${basePath}/dossier-email`,
    emailUploadForm({
      emailFieldName: 'dossierEmailFileName',
      validator: validateDossierEmail,
      unassignUserFromRecall,
      documentCategory: AddDocumentRequest.category.DOSSIER_EMAIL,
      nextPageUrlSuffix: 'dossier-confirmation',
    })
  )
  get(`${basePath}/dossier-confirmation`, viewWithRecallAndPerson('dossierConfirmation'))

  // DOCUMENT DOWNLOADS
  get(`${basePath}/documents/dossier`, downloadDossier)
  get(`${basePath}/documents/letter-to-prison`, downloadLetterToPrison)
  get(`${basePath}/documents/recall-notification`, downloadRecallNotification)
  get(`${basePath}/documents/revocation-order/:documentId`, downloadRevocationOrder)
  get(`${basePath}/documents/reasons-for-recall/:documentId`, downloadReasonsForRecallOrder)
  get(`${basePath}/documents/:documentId`, downloadUploadedDocumentOrEmail)

  get(`${basePath}/view-recall`, viewWithRecallAndPerson('viewFullRecall'))

  // DETAILS FOR CURRENT USER
  get('/user-details', getUser)
  post('/user-details', postUser)

  return router
}
