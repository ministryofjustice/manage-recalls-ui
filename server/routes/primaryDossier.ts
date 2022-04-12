import { Router } from 'express'
import { startRecallPhase } from '../controllers/saveToApi/startRecallPhase'
import { EndPhaseRequest } from '../@types/manage-recalls-api/models/EndPhaseRequest'
import { StartPhaseRequest } from '../@types/manage-recalls-api/models/StartPhaseRequest'
import { UploadDocumentRequest } from '../@types/manage-recalls-api/models/UploadDocumentRequest'
import { recallPageGet } from '../controllers/recallPageGet'
import { recallFormPost } from '../controllers/recallFormPost'
import { validateDossierPrison } from '../controllers/dossier/validators/validateDossierPrison'
import { separateEmailAndFormSave } from '../controllers/separateEmailAndFormSave'
import { validateNsyEmail } from '../controllers/dossier/validators/validateNsyEmail'
import { validateDossierLetter } from '../controllers/dossier/validators/validateDossierLetter'
import { validateDossierDownload } from '../controllers/dossier/validators/validateDossierDownload'
import { validateDossierEmail } from '../controllers/dossier/validators/validateDossierEmail'
import { endRecallPhase } from '../controllers/saveToApi/endRecallPhase'
import { basePath } from './index'

export const primaryDossierRoutes = (router: Router) => {
  router.post(
    `${basePath}/dossier-assign`,
    startRecallPhase({ phase: StartPhaseRequest.phase.DOSSIER, nextPageUrlSuffix: 'dossier-recall' })
  )
  router.get(`${basePath}/dossier-recall`, recallPageGet('dossierRecallInformation'))
  router.get(`${basePath}/dossier-prison`, recallPageGet('dossierPrison'))
  router.post(`${basePath}/dossier-prison`, recallFormPost(validateDossierPrison))
  router.get(`${basePath}/dossier-nsy-email`, recallPageGet('dossierNsyEmail'))
  router.post(
    `${basePath}/dossier-nsy-email`,
    separateEmailAndFormSave({
      uploadFormFieldName: 'nsyEmailFileName',
      validator: validateNsyEmail,
      documentCategory: UploadDocumentRequest.category.NSY_REMOVE_WARRANT_EMAIL,
    })
  )
  router.get(`${basePath}/dossier-letter`, recallPageGet('dossierLetter'))
  router.post(`${basePath}/dossier-letter`, recallFormPost(validateDossierLetter))
  router.get(`${basePath}/dossier-check`, recallPageGet('dossierCheck'))
  router.get(`${basePath}/dossier-download`, recallPageGet('dossierDownload'))
  router.post(`${basePath}/dossier-download`, recallFormPost(validateDossierDownload))
  router.get(`${basePath}/dossier-email`, recallPageGet('dossierEmail'))
  router.post(
    `${basePath}/dossier-email`,
    separateEmailAndFormSave({
      uploadFormFieldName: 'dossierEmailFileName',
      validator: validateDossierEmail,
      saveToApiFn: endRecallPhase(EndPhaseRequest.phase.DOSSIER),
      documentCategory: UploadDocumentRequest.category.DOSSIER_EMAIL,
    })
  )
  router.get(`${basePath}/dossier-confirmation`, recallPageGet('dossierConfirmation'))
}
