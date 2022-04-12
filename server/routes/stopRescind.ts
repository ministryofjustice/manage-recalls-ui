import { Router } from 'express'
import { recallPageGet } from '../controllers/recallPageGet'
import { combinedDocumentAndFormSave } from '../controllers/combinedDocumentAndFormSave'
import { validateRescindRequest } from '../controllers/rescind/validators/validateRescindRequest'
import { addRescindRecord, stopRecall, updateRescindRecord } from '../clients/manageRecallsApiClient'
import { validateRescindDecision } from '../controllers/rescind/validators/validateRescindDecision'
import { recallFormPost } from '../controllers/recallFormPost'
import { validateStopReason } from '../controllers/stop/validators/validateStopReason'
import { basePath } from './index'

export const stopRescindRoutes = (router: Router) => {
  // RESCIND RECALL
  router.get(`${basePath}/rescind-request`, recallPageGet('rescindRequest'))
  router.post(
    `${basePath}/rescind-request`,
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'rescindRequestEmailFileName',
      validator: validateRescindRequest,
      saveToApiFn: addRescindRecord,
    })
  )
  router.get(`${basePath}/rescind-decision`, recallPageGet('rescindDecision'))
  router.post(
    `${basePath}/rescind-decision`,
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'rescindDecisionEmailFileName',
      validator: validateRescindDecision,
      saveToApiFn: updateRescindRecord,
    })
  )

  // STOP RECALL
  router.get(`${basePath}/stop-recall`, recallPageGet('stopRecall'))
  router.post(`${basePath}/stop-recall`, recallFormPost(validateStopReason, stopRecall))
}
