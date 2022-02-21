import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { makeUrl } from '../../utils/makeUrl'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'

export const validateCheckAnswers = ({ user, urlInfo }: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  const valuesToSave = { bookedByUserId: user.uuid }
  return { errors: undefined, valuesToSave, redirectToPage: makeUrl('confirmation', urlInfo) }
}
