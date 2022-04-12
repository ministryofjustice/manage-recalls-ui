import { Router } from 'express'
import { startRecallPhase } from '../controllers/saveToApi/startRecallPhase'
import { recallPageGet } from '../controllers/recallPageGet'
import { recallFormPost } from '../controllers/recallFormPost'
import { validateLegalRep } from '../controllers/secondaryDossier/validators/validateLegalRep'
import { validateSeniorProbationOfficer } from '../controllers/secondaryDossier/validators/validateSeniorProbationOfficer'
import { basePath } from './index'

export const secondaryDossierRoutes = (router: Router) => {
  // CREATE SECONDARY DOSSIER
  router.post(
    `${basePath}/secondary-dossier-assign`,
    startRecallPhase({
      nextPageUrlSuffix: 'secondary-dossier-recall',
    })
  )
  router.get(`${basePath}/secondary-dossier-recall`, recallPageGet('secondaryDossierRecallInfo'))
  router.get(`${basePath}/secondary-dossier-legal-rep`, recallPageGet('secondaryDossierLegalRep'))
  router.post(`${basePath}/secondary-dossier-legal-rep`, recallFormPost(validateLegalRep))
  router.get(`${basePath}/secondary-dossier-probation`, recallPageGet('secondaryDossierProbation'))
  router.post(`${basePath}/secondary-dossier-probation`, recallFormPost(validateSeniorProbationOfficer))
}
