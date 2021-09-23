import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { UserDetails } from '../../../../services/userService'

export const validateCheckAnswers = (
  requestBody: ObjectMap<string>,
  user: UserDetails
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest } => {
  const valuesToSave = { bookedByUserId: user.uuid }
  return { errors: undefined, valuesToSave }
}
