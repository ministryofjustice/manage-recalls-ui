import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'
import { makeUrl } from '../../helpers'

export const validateCheckAnswers = ({ user, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  const valuesToSave = { bookedByUserId: user.uuid }
  return { errors: undefined, valuesToSave, redirectToPage: makeUrl('confirmation', urlInfo) }
}
