import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { validatePrison } from '../../dossier/validators/validateDossierPrison'

export const validateAssessPrison = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  return validatePrison({ requestBody, urlInfo, pageSuffix: 'assess-download' })
}
