import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { findPerson } from './handlers/person/findPerson'
import { createRecall } from './handlers/book/createRecall'
import { recallList } from './handlers/recallList'
import { uploadDocumentsFormHandler } from './handlers/documents/upload/uploadDocumentsFormHandler'
import { viewWithRecallAndPerson } from './handlers/helpers/viewWithRecallAndPerson'
import { uploadEmailFormHandler } from './handlers/documents/upload/uploadEmailFormHandler'
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
import { downloadDocumentOrEmail } from './handlers/documents/download/downloadDocumentOrEmail'
import { validateRecallNotificationEmail } from './handlers/assess/helpers/validateRecallNotificationEmail'
import { validateDossierEmail } from './handlers/dossier/helpers/validateDossierEmail'
import { validatePreConsName } from './handlers/book/helpers/validatePreConsName'
import { validateDossierDownload } from './handlers/dossier/helpers/validateDossierDownload'
import { validateCheckAnswers } from './handlers/book/helpers/validateCheckAnswers'
import { getUser, postUser } from './handlers/user/userDetails'
import { parseUrlParams } from '../middleware/parseUrlParams'
import { fetchRemoteRefData } from '../referenceData'
import { assignUser } from './handlers/helpers/assignUser'
import { unassignUserFromRecall } from '../clients/manageRecallsApiClient'
import { addMissingDocumentRecordFormHandler } from './handlers/documents/missing-documents/addMissingDocumentRecordFormHandler'
import { validateLicenceName } from './handlers/book/helpers/validateLicenceName'
import { checkUserDetailsExist } from '../middleware/checkUserDetailsExist'
import { uploadDocumentVersionFormHandler } from './handlers/documents/upload/uploadDocumentVersionFormHandler'
import { getDocumentChangeHistory } from './handlers/change-history/getDocumentChangeHistory'
import { newGeneratedDocumentVersion } from './handlers/documents/generated/newGeneratedDocumentVersion'
import { createGeneratedDocument } from './handlers/documents/generated/createGeneratedDocument'
import { getSingleFieldChangeHistory } from './handlers/change-history/getSingleFieldChangeHistory'
import { getAllFieldsChangeHistory } from './handlers/change-history/getAllFieldsChangeHistory'
import { validateCustodyStatus } from './handlers/book/helpers/validateCustodyStatus'
import { addLastKnownAddressHandler } from './handlers/book/addLastKnownAddressHandler'
import { findAddressHandler } from './handlers/book/findAddressHandler'
import { validateLastKnownAddress } from './handlers/book/helpers/validateLastKnownAddress'
import { selectLookupAddressHandler } from './handlers/book/selectLookupAddressHandler'
import { addAnotherAddressHandler } from './handlers/book/addAnotherAddressHandler'
import { deleteAddressHandler } from './handlers/book/deleteAddressHandler'
import { UploadDocumentRequest } from '../@types/manage-recalls-api/models/UploadDocumentRequest'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  router.get('/', checkUserDetailsExist, recallList)
  get('/find-person', findPerson)

  post('/persons/:nomsNumber/recalls', createRecall)

  const basePath = '/persons/:nomsNumber/recalls/:recallId'

  router.use(`${basePath}/:pageSlug`, parseUrlParams, fetchRemoteRefData)

  // BOOK A RECALL
  get(`${basePath}/licence-name`, viewWithRecallAndPerson('recallLicenceName'))
  post(`${basePath}/licence-name`, handleRecallFormPost(validateLicenceName))
  get(`${basePath}/pre-cons-name`, viewWithRecallAndPerson('recallPreConsName'))
  post(`${basePath}/pre-cons-name`, handleRecallFormPost(validatePreConsName))
  get(`${basePath}/custody-status`, viewWithRecallAndPerson('recallCustodyStatus'))
  post(`${basePath}/custody-status`, handleRecallFormPost(validateCustodyStatus))
  get(`${basePath}/last-known-address`, viewWithRecallAndPerson('recallLastKnownAddress'))
  post(`${basePath}/last-known-address`, handleRecallFormPost(validateLastKnownAddress))
  get(`${basePath}/postcode-lookup`, viewWithRecallAndPerson('recallFindAddress'))
  router.get(`${basePath}/postcode-results`, findAddressHandler, viewWithRecallAndPerson('recallFindAddressResults'))
  post(`${basePath}/postcode-results`, selectLookupAddressHandler)
  get(`${basePath}/address-manual`, viewWithRecallAndPerson('recallAddressManual'))
  post(`${basePath}/address-manual`, addLastKnownAddressHandler)
  get(`${basePath}/address-list`, viewWithRecallAndPerson('recallAddressList'))
  post(`${basePath}/address-list`, addAnotherAddressHandler)
  post(`${basePath}/address-list-delete`, deleteAddressHandler)
  get(`${basePath}/request-received`, viewWithRecallAndPerson('recallRequestReceived'))
  post(
    `${basePath}/request-received`,
    uploadEmailFormHandler({
      emailFieldName: 'recallRequestEmailFileName',
      validator: validateRecallRequestReceived,
      documentCategory: UploadDocumentRequest.category.RECALL_REQUEST_EMAIL,
    })
  )
  get(`${basePath}/last-release`, viewWithRecallAndPerson('recallSentenceDetails'))
  post(`${basePath}/last-release`, handleRecallFormPost(validateSentenceDetails))
  get(`${basePath}/prison-police`, viewWithRecallAndPerson('recallPrisonPolice'))
  post(`${basePath}/prison-police`, handleRecallFormPost(validatePolice))
  get(`${basePath}/issues-needs`, viewWithRecallAndPerson('recallIssuesNeeds'))
  post(`${basePath}/issues-needs`, handleRecallFormPost(validateIssuesNeeds))
  get(`${basePath}/probation-officer`, viewWithRecallAndPerson('recallProbationOfficer'))
  post(`${basePath}/probation-officer`, handleRecallFormPost(validateProbationOfficer))
  get(`${basePath}/upload-documents`, viewWithRecallAndPerson('recallDocuments'))
  post(`${basePath}/upload-documents`, uploadDocumentsFormHandler)
  get(`${basePath}/missing-documents`, viewWithRecallAndPerson('recallMissingDocuments'))
  post(`${basePath}/missing-documents`, addMissingDocumentRecordFormHandler)
  get(`${basePath}/upload-document-version`, viewWithRecallAndPerson('recallUploadDocumentVersion'))
  post(`${basePath}/upload-document-version`, uploadDocumentVersionFormHandler)
  get(`${basePath}/check-answers`, viewWithRecallAndPerson('recallCheckAnswers'))
  post(`${basePath}/check-answers`, handleRecallFormPost(validateCheckAnswers))
  get(`${basePath}/confirmation`, viewWithRecallAndPerson('recallConfirmation'))

  // ASSESS A RECALL
  post(`${basePath}/assess-assign`, assignUser({ nextPageUrlSuffix: 'assess' }))
  get(`${basePath}/assess`, viewWithRecallAndPerson('assessRecall'))
  get(`${basePath}/assess-decision`, viewWithRecallAndPerson('assessDecision'))
  post(`${basePath}/assess-decision`, handleRecallFormPost(validateDecision))
  get(`${basePath}/assess-stop`, viewWithRecallAndPerson('assessStop'))
  get(`${basePath}/assess-licence`, viewWithRecallAndPerson('assessLicence'))
  post(`${basePath}/assess-licence`, handleRecallFormPost(validateLicence))
  get(`${basePath}/assess-prison`, viewWithRecallAndPerson('assessPrison'))
  post(`${basePath}/assess-prison`, handleRecallFormPost(validatePrison))
  get('/persons/:nomsNumber/recalls/:recallId/assess-download', viewWithRecallAndPerson('assessDownload'))
  get(`${basePath}/assess-email`, viewWithRecallAndPerson('assessEmail'))
  post(
    `${basePath}/assess-email`,
    uploadEmailFormHandler({
      emailFieldName: 'recallNotificationEmailFileName',
      validator: validateRecallNotificationEmail,
      unassignUserFromRecall,
      documentCategory: UploadDocumentRequest.category.RECALL_NOTIFICATION_EMAIL,
    })
  )
  get(`${basePath}/assess-confirmation`, viewWithRecallAndPerson('assessConfirmation'))

  // CREATE DOSSIER
  post(`${basePath}/dossier-assign`, assignUser({ nextPageUrlSuffix: 'dossier-recall' }))
  get(`${basePath}/dossier-recall`, viewWithRecallAndPerson('dossierRecallInformation'))
  get(`${basePath}/dossier-letter`, viewWithRecallAndPerson('dossierLetter'))
  post(`${basePath}/dossier-letter`, handleRecallFormPost(validateDossierLetter))
  get(`${basePath}/dossier-check`, viewWithRecallAndPerson('dossierCheck'))
  get(`${basePath}/dossier-download`, viewWithRecallAndPerson('dossierDownload'))
  post(`${basePath}/dossier-download`, handleRecallFormPost(validateDossierDownload))
  get(`${basePath}/dossier-email`, viewWithRecallAndPerson('dossierEmail'))
  post(
    `${basePath}/dossier-email`,
    uploadEmailFormHandler({
      emailFieldName: 'dossierEmailFileName',
      validator: validateDossierEmail,
      unassignUserFromRecall,
      documentCategory: UploadDocumentRequest.category.DOSSIER_EMAIL,
    })
  )
  get(`${basePath}/dossier-confirmation`, viewWithRecallAndPerson('dossierConfirmation'))

  get(`${basePath}/generated-document-version`, viewWithRecallAndPerson('newGeneratedDocumentVersion'))
  post(`${basePath}/generated-document-version`, newGeneratedDocumentVersion)

  // GENERATE AND DOWNLOAD A NEW RECALL NOTIFICATION, DOSSIER OR LETTER TO PRISON
  router.get(`${basePath}/documents/create`, createGeneratedDocument, downloadDocumentOrEmail)

  // DOWNLOAD AN EXISTING UPLOADED DOCUMENT, EMAIL, OR GENERATED DOCUMENT
  get(`${basePath}/documents/:documentId`, downloadDocumentOrEmail)

  get(`${basePath}/view-recall`, viewWithRecallAndPerson('viewFullRecall'))

  // AUDIT / CHANGE HISTORY
  router.get(
    `${basePath}/change-history/document`,
    getDocumentChangeHistory,
    viewWithRecallAndPerson('changeHistoryForDocument')
  )
  router.get(
    `${basePath}/change-history/field`,
    getSingleFieldChangeHistory,
    viewWithRecallAndPerson('changeHistoryForField')
  )
  router.get(`${basePath}/change-history`, getAllFieldsChangeHistory, viewWithRecallAndPerson('changeHistory'))

  // DETAILS FOR CURRENT USER
  get('/user-details', getUser)
  post('/user-details', postUser)

  return router
}
