import type { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { findPerson } from '../controllers/findPerson/findPerson'
import { createRecall } from '../controllers/book/createRecall'
import { recallList } from '../controllers/recallsList/recallList'
import { uploadDocumentsFormHandler } from '../controllers/documents/upload/uploadDocumentsFormHandler'
import { recallPageGet } from '../controllers/recallPageGet'
import { separateEmailAndFormSave } from '../controllers/separateEmailAndFormSave'
import { recallFormPost } from '../controllers/recallFormPost'
import { validateDecision } from '../controllers/assess/validators/validateDecision'
import { validateDossierLetter } from '../controllers/dossier/validators/validateDossierLetter'
import { validateLicence } from '../controllers/assess/validators/validateLicence'
import { validateAssessPrison } from '../controllers/assess/validators/validatePrison'
import { validateRecallRequestReceived } from '../controllers/book/validators/validateRecallRequestReceived'
import { validateSentenceDetails } from '../controllers/book/validators/validateSentenceDetails'
import { validatePolice } from '../controllers/book/validators/validatePolice'
import { validateIssuesNeeds } from '../controllers/book/validators/validateIssuesNeeds'
import { validateProbationOfficer } from '../controllers/book/validators/validateProbationOfficer'
import { downloadDocumentOrEmail } from '../controllers/documents/download/downloadDocumentOrEmail'
import { validateRecallNotificationEmail } from '../controllers/assess/validators/validateRecallNotificationEmail'
import { validateDossierEmail } from '../controllers/dossier/validators/validateDossierEmail'
import { validatePreConsName } from '../controllers/book/validators/validatePreConsName'
import { validateDossierDownload } from '../controllers/dossier/validators/validateDossierDownload'
import { validateCheckAnswers } from '../controllers/book/validators/validateCheckAnswers'
import { getUser, postUser } from '../controllers/userDetails/userDetails'
import { parseUrlParams, returnToRecallListParam } from '../middleware/parseUrlParams'
import { fetchRemoteRefData } from '../referenceData'
import { startRecallPhase } from '../controllers/saveToApi/startRecallPhase'
import {
  addLastKnownAddress,
  addNote,
  addPartbRecord,
  addRescindRecord,
  addReturnToCustodyDates,
  setConfirmedRecallType,
  setRecommendedRecallType,
  stopRecall,
  updateRescindRecord,
} from '../clients/manageRecallsApiClient'
import { createMissingDocumentRecord } from '../controllers/documents/missing-documents/createMissingDocumentRecord'
import { validateLicenceName } from '../controllers/book/validators/validateLicenceName'
import { checkUserDetailsExist } from '../middleware/checkUserDetailsExist'
import { uploadDocumentVersionFormHandler } from '../controllers/documents/upload/uploadDocumentVersionFormHandler'
import { getDocumentChangeHistory } from '../controllers/changeHistory/getDocumentChangeHistory'
import { newGeneratedDocumentVersion } from '../controllers/documents/generated/newGeneratedDocumentVersion'
import { createGeneratedDocument } from '../controllers/documents/generated/createGeneratedDocument'
import { getSingleFieldChangeHistory } from '../controllers/changeHistory/getSingleFieldChangeHistory'
import { getAllFieldsChangeHistory } from '../controllers/changeHistory/getAllFieldsChangeHistory'
import { validateCustodyStatus } from '../controllers/book/validators/validateCustodyStatus'
import { findAddressHandler } from '../controllers/book/findAddressHandler'
import { validateLastKnownAddress } from '../controllers/book/validators/validateLastKnownAddress'
import { selectLookupAddressHandler } from '../controllers/book/selectLookupAddressHandler'
import { addAnotherAddressHandler } from '../controllers/book/addAnotherAddressHandler'
import { deleteAddressHandler } from '../controllers/book/deleteAddressHandler'
import { validateConfirmCustodyStatus } from '../controllers/assess/validators/validateConfirmCustodyStatus'
import { validateWarrantReference } from '../controllers/assess/validators/validateWarrantReference'
import { saveWarrantReference } from '../controllers/assess/helpers/saveWarrantReference'
import { validateStopReason } from '../controllers/stop/validators/validateStopReason'
import { validateReturnToCustodyDates } from '../controllers/assess/validators/validateReturnToCustodyDates'
import { validateDossierPrison } from '../controllers/dossier/validators/validateDossierPrison'
import { validateNsyEmail } from '../controllers/dossier/validators/validateNsyEmail'
import { validateRecallType } from '../controllers/book/validators/validateRecallType'
import { endRecallPhase } from '../controllers/saveToApi/endRecallPhase'
import { UploadDocumentRequest } from '../@types/manage-recalls-api/models/UploadDocumentRequest'
import { validateAddNote } from '../controllers/note/validators/validateAddNote'
import { combinedDocumentAndFormSave } from '../controllers/combinedDocumentAndFormSave'
import { validateMissingDocuments } from '../controllers/documents/missing-documents/validators/validateMissingDocuments'
import { validateRescindRequest } from '../controllers/rescind/validators/validateRescindRequest'
import { validateRescindDecision } from '../controllers/rescind/validators/validateRescindDecision'
import { validateAddressManual } from '../controllers/book/validators/validateAddressManual'
import { combinedMultipleFilesAndFormSave } from '../controllers/combinedMultipleFilesAndFormSave'
import { validatePartB } from '../controllers/partB/validators/validatePartB'
import { validateSupportRerelease } from '../controllers/partB/validators/validateSupportRerelease'
import { getStoredSessionData } from '../middleware/getStoredSessionData'
import { EndPhaseRequest } from '../@types/manage-recalls-api/models/EndPhaseRequest'
import { StartPhaseRequest } from '../@types/manage-recalls-api/models/StartPhaseRequest'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  router.get('/user-details', getStoredSessionData, getUser)
  router.post('/user-details', getStoredSessionData, postUser)

  router.get('/', checkUserDetailsExist, getStoredSessionData, asyncMiddleware(recallList))

  router.get('/find-person', getStoredSessionData, asyncMiddleware(findPerson))

  post('/recalls', createRecall)

  const basePath = '/recalls/:recallId'

  // getStoredSessionData must come after parseUrlParams
  router.use(`${basePath}/:pageSlug`, parseUrlParams, getStoredSessionData, fetchRemoteRefData)

  // BOOK A RECALL
  router.get(`${basePath}/licence-name`, returnToRecallListParam, recallPageGet('recallLicenceName'))
  post(`${basePath}/licence-name`, recallFormPost(validateLicenceName))
  router.get(`${basePath}/pre-cons-name`, returnToRecallListParam, recallPageGet('recallPreConsName'))
  post(`${basePath}/pre-cons-name`, recallFormPost(validatePreConsName))
  get(`${basePath}/custody-status`, recallPageGet('recallCustodyStatus'))
  post(`${basePath}/custody-status`, recallFormPost(validateCustodyStatus))
  get(`${basePath}/last-known-address`, recallPageGet('recallLastKnownAddress'))
  post(`${basePath}/last-known-address`, recallFormPost(validateLastKnownAddress))
  get(`${basePath}/postcode-lookup`, recallPageGet('recallFindAddress'))
  router.get(`${basePath}/postcode-results`, findAddressHandler, recallPageGet('recallFindAddressResults'))
  post(`${basePath}/postcode-results`, selectLookupAddressHandler)
  get(`${basePath}/address-manual`, recallPageGet('recallAddressManual'))
  post(`${basePath}/address-manual`, recallFormPost(validateAddressManual, addLastKnownAddress))
  get(`${basePath}/address-list`, recallPageGet('recallAddressList'))
  post(`${basePath}/address-list`, addAnotherAddressHandler)
  post(`${basePath}/address-list-delete`, deleteAddressHandler)
  get(`${basePath}/recall-type`, recallPageGet('recommendedRecallType'))
  post(`${basePath}/recall-type`, recallFormPost(validateRecallType, setRecommendedRecallType))
  get(`${basePath}/request-received`, recallPageGet('recallRequestReceived'))
  post(
    `${basePath}/request-received`,
    separateEmailAndFormSave({
      uploadFormFieldName: 'recallRequestEmailFileName',
      validator: validateRecallRequestReceived,
      documentCategory: UploadDocumentRequest.category.RECALL_REQUEST_EMAIL,
    })
  )
  get(`${basePath}/last-release`, recallPageGet('recallSentenceDetails'))
  post(`${basePath}/last-release`, recallFormPost(validateSentenceDetails))
  get(`${basePath}/prison-police`, recallPageGet('recallPrisonPolice'))
  post(`${basePath}/prison-police`, recallFormPost(validatePolice))
  get(`${basePath}/issues-needs`, recallPageGet('recallIssuesNeeds'))
  post(`${basePath}/issues-needs`, recallFormPost(validateIssuesNeeds))
  get(`${basePath}/probation-officer`, recallPageGet('recallProbationOfficer'))
  post(`${basePath}/probation-officer`, recallFormPost(validateProbationOfficer))
  get(`${basePath}/upload-documents`, recallPageGet('recallDocuments'))
  post(`${basePath}/upload-documents`, uploadDocumentsFormHandler)
  get(`${basePath}/missing-documents`, recallPageGet('recallMissingDocuments'))
  post(
    `${basePath}/missing-documents`,
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'missingDocumentsEmailFileName',
      validator: validateMissingDocuments,
      saveToApiFn: createMissingDocumentRecord,
    })
  )
  get(`${basePath}/upload-document-version`, recallPageGet('recallUploadDocumentVersion'))
  post(`${basePath}/upload-document-version`, uploadDocumentVersionFormHandler)
  get(`${basePath}/check-answers`, recallPageGet('recallCheckAnswers'))
  post(`${basePath}/check-answers`, recallFormPost(validateCheckAnswers, endRecallPhase(EndPhaseRequest.phase.BOOK)))
  get(`${basePath}/confirmation`, recallPageGet('recallConfirmation'))

  // ASSESS A RECALL
  post(
    `${basePath}/assess-assign`,
    startRecallPhase({ phase: StartPhaseRequest.phase.ASSESS, nextPageUrlSuffix: 'assess' })
  )
  get(`${basePath}/assess`, recallPageGet('assessRecall'))
  get(`${basePath}/assess-decision`, recallPageGet('assessDecision'))

  post(
    `${basePath}/assess-decision`,
    separateEmailAndFormSave({
      uploadFormFieldName: 'confirmedRecallTypeEmailFileName',
      validator: validateDecision,
      saveToApiFn: setConfirmedRecallType,
      documentCategory: UploadDocumentRequest.category.CHANGE_RECALL_TYPE_EMAIL,
    })
  )
  get(`${basePath}/assess-licence`, recallPageGet('assessLicence'))
  post(`${basePath}/assess-licence`, recallFormPost(validateLicence))
  get(`${basePath}/assess-custody-status`, recallPageGet('assessCustodyStatus'))
  post(`${basePath}/assess-custody-status`, recallFormPost(validateConfirmCustodyStatus))
  get(`${basePath}/assess-prison`, recallPageGet('assessPrison'))
  post(`${basePath}/assess-prison`, recallFormPost(validateAssessPrison))
  get(`${basePath}/assess-download`, recallPageGet('assessDownload'))
  get(`${basePath}/assess-email`, recallPageGet('assessEmail'))
  post(
    `${basePath}/assess-email`,
    separateEmailAndFormSave({
      uploadFormFieldName: 'recallNotificationEmailFileName',
      validator: validateRecallNotificationEmail,
      saveToApiFn: endRecallPhase(StartPhaseRequest.phase.ASSESS),
      documentCategory: UploadDocumentRequest.category.RECALL_NOTIFICATION_EMAIL,
    })
  )
  get(`${basePath}/assess-confirmation`, recallPageGet('assessConfirmation'))
  get(`${basePath}/warrant-reference`, recallPageGet('warrantReference'))
  post(`${basePath}/warrant-reference`, recallFormPost(validateWarrantReference, saveWarrantReference))
  get(`${basePath}/rtc-dates`, recallPageGet('rtcDates'))
  post(`${basePath}/rtc-dates`, recallFormPost(validateReturnToCustodyDates, addReturnToCustodyDates))

  // CREATE DOSSIER
  post(
    `${basePath}/dossier-assign`,
    startRecallPhase({ phase: StartPhaseRequest.phase.DOSSIER, nextPageUrlSuffix: 'dossier-recall' })
  )
  get(`${basePath}/dossier-recall`, recallPageGet('dossierRecallInformation'))
  get(`${basePath}/dossier-prison`, recallPageGet('dossierPrison'))
  post(`${basePath}/dossier-prison`, recallFormPost(validateDossierPrison))
  get(`${basePath}/dossier-nsy-email`, recallPageGet('dossierNsyEmail'))
  post(
    `${basePath}/dossier-nsy-email`,
    separateEmailAndFormSave({
      uploadFormFieldName: 'nsyEmailFileName',
      validator: validateNsyEmail,
      documentCategory: UploadDocumentRequest.category.NSY_REMOVE_WARRANT_EMAIL,
    })
  )
  get(`${basePath}/dossier-letter`, recallPageGet('dossierLetter'))
  post(`${basePath}/dossier-letter`, recallFormPost(validateDossierLetter))
  get(`${basePath}/dossier-check`, recallPageGet('dossierCheck'))
  get(`${basePath}/dossier-download`, recallPageGet('dossierDownload'))
  post(`${basePath}/dossier-download`, recallFormPost(validateDossierDownload))
  get(`${basePath}/dossier-email`, recallPageGet('dossierEmail'))
  post(
    `${basePath}/dossier-email`,
    separateEmailAndFormSave({
      uploadFormFieldName: 'dossierEmailFileName',
      validator: validateDossierEmail,
      saveToApiFn: endRecallPhase(EndPhaseRequest.phase.DOSSIER),
      documentCategory: UploadDocumentRequest.category.DOSSIER_EMAIL,
    })
  )
  get(`${basePath}/dossier-confirmation`, recallPageGet('dossierConfirmation'))

  get(`${basePath}/generated-document-version`, recallPageGet('newGeneratedDocumentVersion'))
  post(`${basePath}/generated-document-version`, newGeneratedDocumentVersion)

  // GENERATE AND DOWNLOAD A NEW RECALL NOTIFICATION, DOSSIER OR LETTER TO PRISON
  router.get(`${basePath}/documents/create`, createGeneratedDocument, downloadDocumentOrEmail)

  // DOWNLOAD AN EXISTING UPLOADED DOCUMENT, EMAIL, OR GENERATED DOCUMENT
  get(`${basePath}/documents/:documentId`, downloadDocumentOrEmail)

  get(`${basePath}/view-recall`, recallPageGet('viewFullRecall'))

  // AUDIT / CHANGE HISTORY
  router.get(`${basePath}/change-history/document`, getDocumentChangeHistory, recallPageGet('changeHistoryForDocument'))
  router.get(`${basePath}/change-history/field`, getSingleFieldChangeHistory, recallPageGet('changeHistoryForField'))
  router.get(`${basePath}/change-history`, getAllFieldsChangeHistory, recallPageGet('changeHistory'))

  // ADD NOTE
  get(`${basePath}/add-note`, recallPageGet('addNote'))
  post(
    `${basePath}/add-note`,
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'fileName',
      validator: validateAddNote,
      saveToApiFn: addNote,
    })
  )

  // RESCIND RECALL
  get(`${basePath}/rescind-request`, recallPageGet('rescindRequest'))
  post(
    `${basePath}/rescind-request`,
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'rescindRequestEmailFileName',
      validator: validateRescindRequest,
      saveToApiFn: addRescindRecord,
    })
  )
  get(`${basePath}/rescind-decision`, recallPageGet('rescindDecision'))
  post(
    `${basePath}/rescind-decision`,
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'rescindDecisionEmailFileName',
      validator: validateRescindDecision,
      saveToApiFn: updateRescindRecord,
    })
  )

  // STOP RECALL
  get(`${basePath}/stop-recall`, recallPageGet('stopRecall'))
  post(`${basePath}/stop-recall`, recallFormPost(validateStopReason, stopRecall))

  // UPLOAD PART B
  get(`${basePath}/part-b`, recallPageGet('partB'))
  post(
    `${basePath}/part-b`,
    combinedMultipleFilesAndFormSave({
      uploadFormFieldNames: ['partBFileName', 'oasysFileName', 'emailFileName'],
      validator: validatePartB,
      saveToApiFn: addPartbRecord,
    })
  )
  get(`${basePath}/support-rerelease`, recallPageGet('supportRerelease'))
  post(`${basePath}/support-rerelease`, recallFormPost(validateSupportRerelease))

  return router
}
