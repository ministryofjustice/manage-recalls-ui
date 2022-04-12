import { Router } from 'express'
import { returnToRecallListParam } from '../middleware/parseUrlParams'
import { recallPageGet } from '../controllers/recallPageGet'
import { recallFormPost } from '../controllers/recallFormPost'
import { validateLicenceName } from '../controllers/book/validators/validateLicenceName'
import { validatePreConsName } from '../controllers/book/validators/validatePreConsName'
import { validateCustodyStatus } from '../controllers/book/validators/validateCustodyStatus'
import { validateLastKnownAddress } from '../controllers/book/validators/validateLastKnownAddress'
import { findAddressHandler } from '../controllers/book/findAddressHandler'
import { selectLookupAddressHandler } from '../controllers/book/selectLookupAddressHandler'
import { validateAddressManual } from '../controllers/book/validators/validateAddressManual'
import { addLastKnownAddress, setRecommendedRecallType } from '../clients/manageRecallsApiClient'
import { addAnotherAddressHandler } from '../controllers/book/addAnotherAddressHandler'
import { deleteAddressHandler } from '../controllers/book/deleteAddressHandler'
import { validateRecallType } from '../controllers/book/validators/validateRecallType'
import { separateEmailAndFormSave } from '../controllers/separateEmailAndFormSave'
import { validateRecallRequestReceived } from '../controllers/book/validators/validateRecallRequestReceived'
import { EndPhaseRequest } from '../@types/manage-recalls-api/models/EndPhaseRequest'
import { UploadDocumentRequest } from '../@types/manage-recalls-api/models/UploadDocumentRequest'
import { validateSentenceDetails } from '../controllers/book/validators/validateSentenceDetails'
import { validatePolice } from '../controllers/book/validators/validatePolice'
import { validateIssuesNeeds } from '../controllers/book/validators/validateIssuesNeeds'
import { validateProbationOfficer } from '../controllers/book/validators/validateProbationOfficer'
import { uploadDocumentsFormHandler } from '../controllers/documents/upload/uploadDocumentsFormHandler'
import { combinedDocumentAndFormSave } from '../controllers/combinedDocumentAndFormSave'
import { validateMissingDocuments } from '../controllers/documents/missing-documents/validators/validateMissingDocuments'
import { createMissingDocumentRecord } from '../controllers/documents/missing-documents/createMissingDocumentRecord'
import { uploadDocumentVersionFormHandler } from '../controllers/documents/upload/uploadDocumentVersionFormHandler'
import { validateCheckAnswers } from '../controllers/book/validators/validateCheckAnswers'
import { endRecallPhase } from '../controllers/saveToApi/endRecallPhase'
import { basePath } from './index'

export const bookRoutes = (router: Router) => {
  router.get(`${basePath}/licence-name`, returnToRecallListParam, recallPageGet('recallLicenceName'))
  router.post(`${basePath}/licence-name`, recallFormPost(validateLicenceName))
  router.get(`${basePath}/pre-cons-name`, returnToRecallListParam, recallPageGet('recallPreConsName'))
  router.post(`${basePath}/pre-cons-name`, recallFormPost(validatePreConsName))
  router.get(`${basePath}/custody-status`, recallPageGet('recallCustodyStatus'))
  router.post(`${basePath}/custody-status`, recallFormPost(validateCustodyStatus))
  router.get(`${basePath}/last-known-address`, recallPageGet('recallLastKnownAddress'))
  router.post(`${basePath}/last-known-address`, recallFormPost(validateLastKnownAddress))
  router.get(`${basePath}/postcode-lookup`, recallPageGet('recallFindAddress'))
  router.get(`${basePath}/postcode-results`, findAddressHandler, recallPageGet('recallFindAddressResults'))
  router.post(`${basePath}/postcode-results`, selectLookupAddressHandler)
  router.get(`${basePath}/address-manual`, recallPageGet('recallAddressManual'))
  router.post(`${basePath}/address-manual`, recallFormPost(validateAddressManual, addLastKnownAddress))
  router.get(`${basePath}/address-list`, recallPageGet('recallAddressList'))
  router.post(`${basePath}/address-list`, addAnotherAddressHandler)
  router.post(`${basePath}/address-list-delete`, deleteAddressHandler)
  router.get(`${basePath}/recall-type`, recallPageGet('recommendedRecallType'))
  router.post(`${basePath}/recall-type`, recallFormPost(validateRecallType, setRecommendedRecallType))
  router.get(`${basePath}/request-received`, recallPageGet('recallRequestReceived'))
  router.post(
    `${basePath}/request-received`,
    separateEmailAndFormSave({
      uploadFormFieldName: 'recallRequestEmailFileName',
      validator: validateRecallRequestReceived,
      documentCategory: UploadDocumentRequest.category.RECALL_REQUEST_EMAIL,
    })
  )
  router.get(`${basePath}/last-release`, recallPageGet('recallSentenceDetails'))
  router.post(`${basePath}/last-release`, recallFormPost(validateSentenceDetails))
  router.get(`${basePath}/prison-police`, recallPageGet('recallPrisonPolice'))
  router.post(`${basePath}/prison-police`, recallFormPost(validatePolice))
  router.get(`${basePath}/issues-needs`, recallPageGet('recallIssuesNeeds'))
  router.post(`${basePath}/issues-needs`, recallFormPost(validateIssuesNeeds))
  router.get(`${basePath}/probation-officer`, recallPageGet('recallProbationOfficer'))
  router.post(`${basePath}/probation-officer`, recallFormPost(validateProbationOfficer))
  router.get(`${basePath}/upload-documents`, recallPageGet('recallDocuments'))
  router.post(`${basePath}/upload-documents`, uploadDocumentsFormHandler)
  router.get(`${basePath}/missing-documents`, recallPageGet('recallMissingDocuments'))
  router.post(
    `${basePath}/missing-documents`,
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'missingDocumentsEmailFileName',
      validator: validateMissingDocuments,
      saveToApiFn: createMissingDocumentRecord,
    })
  )
  router.get(`${basePath}/upload-document-version`, recallPageGet('recallUploadDocumentVersion'))
  router.post(`${basePath}/upload-document-version`, uploadDocumentVersionFormHandler)
  router.get(`${basePath}/check-answers`, recallPageGet('recallCheckAnswers'))
  router.post(
    `${basePath}/check-answers`,
    recallFormPost(validateCheckAnswers, endRecallPhase(EndPhaseRequest.phase.BOOK))
  )
  router.get(`${basePath}/confirmation`, recallPageGet('recallConfirmation'))
}
