import { Router } from 'express'
import { startRecallPhase } from '../controllers/saveToApi/startRecallPhase'
import { StartPhaseRequest } from '../@types/manage-recalls-api/models/StartPhaseRequest'
import { UploadDocumentRequest } from '../@types/manage-recalls-api/models/UploadDocumentRequest'
import { recallPageGet } from '../controllers/recallPageGet'
import { separateEmailAndFormSave } from '../controllers/separateEmailAndFormSave'
import { validateDecision } from '../controllers/assess/validators/validateDecision'
import { addReturnToCustodyDates, setConfirmedRecallType } from '../clients/manageRecallsApiClient'
import { recallFormPost } from '../controllers/recallFormPost'
import { validateLicence } from '../controllers/assess/validators/validateLicence'
import { validateConfirmCustodyStatus } from '../controllers/assess/validators/validateConfirmCustodyStatus'
import { validateAssessPrison } from '../controllers/assess/validators/validatePrison'
import { validateRecallNotificationEmail } from '../controllers/assess/validators/validateRecallNotificationEmail'
import { endRecallPhase } from '../controllers/saveToApi/endRecallPhase'
import { validateWarrantReference } from '../controllers/assess/validators/validateWarrantReference'
import { updateAndUnassign } from '../controllers/assess/helpers/updateAndUnassign'
import { validateReturnToCustodyDates } from '../controllers/assess/validators/validateReturnToCustodyDates'
import { basePath } from './index'

export const assessRoutes = (router: Router) => {
  router.post(
    `${basePath}/assess-assign`,
    startRecallPhase({ phase: StartPhaseRequest.phase.ASSESS, nextPageUrlSuffix: 'assess' })
  )
  router.get(`${basePath}/assess`, recallPageGet('assessRecall'))
  router.get(`${basePath}/assess-decision`, recallPageGet('assessDecision'))

  router.post(
    `${basePath}/assess-decision`,
    separateEmailAndFormSave({
      uploadFormFieldName: 'confirmedRecallTypeEmailFileName',
      validator: validateDecision,
      saveToApiFn: setConfirmedRecallType,
      documentCategory: UploadDocumentRequest.category.CHANGE_RECALL_TYPE_EMAIL,
    })
  )
  router.get(`${basePath}/assess-licence`, recallPageGet('assessLicence'))
  router.post(`${basePath}/assess-licence`, recallFormPost(validateLicence))
  router.get(`${basePath}/assess-custody-status`, recallPageGet('assessCustodyStatus'))
  router.post(`${basePath}/assess-custody-status`, recallFormPost(validateConfirmCustodyStatus))
  router.get(`${basePath}/assess-prison`, recallPageGet('assessPrison'))
  router.post(`${basePath}/assess-prison`, recallFormPost(validateAssessPrison))
  router.get(`${basePath}/assess-download`, recallPageGet('assessDownload'))
  router.get(`${basePath}/assess-email`, recallPageGet('assessEmail'))
  router.post(
    `${basePath}/assess-email`,
    separateEmailAndFormSave({
      uploadFormFieldName: 'recallNotificationEmailFileName',
      validator: validateRecallNotificationEmail,
      saveToApiFn: endRecallPhase(StartPhaseRequest.phase.ASSESS),
      documentCategory: UploadDocumentRequest.category.RECALL_NOTIFICATION_EMAIL,
    })
  )
  router.get(`${basePath}/assess-confirmation`, recallPageGet('assessConfirmation'))
  router.get(`${basePath}/warrant-reference`, recallPageGet('warrantReference'))
  router.post(`${basePath}/warrant-reference`, recallFormPost(validateWarrantReference, updateAndUnassign))
  router.get(`${basePath}/rtc-dates`, recallPageGet('rtcDates'))
  router.post(`${basePath}/rtc-dates`, recallFormPost(validateReturnToCustodyDates, addReturnToCustodyDates))
}
