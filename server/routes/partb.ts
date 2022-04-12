import { Router } from 'express'
import { recallPageGet } from '../controllers/recallPageGet'
import { combinedMultipleFilesAndFormSave } from '../controllers/combinedMultipleFilesAndFormSave'
import { validatePartB } from '../controllers/partB/validators/validatePartB'
import { addPartbRecord } from '../clients/manageRecallsApiClient'
import { recallFormPost } from '../controllers/recallFormPost'
import { validateSupportRerelease } from '../controllers/partB/validators/validateSupportRerelease'
import { updateAndUnassign } from '../controllers/assess/helpers/updateAndUnassign'
import { basePath } from './index'

export const partbRoutes = (router: Router) => {
  // UPLOAD PART B
  router.get(`${basePath}/part-b`, recallPageGet('partB'))
  router.post(
    `${basePath}/part-b`,
    combinedMultipleFilesAndFormSave({
      uploadFormFieldNames: ['partBFileName', 'oasysFileName', 'emailFileName'],
      validator: validatePartB,
      saveToApiFn: addPartbRecord,
    })
  )
  router.get(`${basePath}/support-rerelease`, recallPageGet('supportRerelease'))
  router.post(`${basePath}/support-rerelease`, recallFormPost(validateSupportRerelease, updateAndUnassign))
}
