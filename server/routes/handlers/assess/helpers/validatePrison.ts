import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'

export const validatePrison = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest } => {
  let errors
  let valuesToSave

  const { currentPrison } = requestBody
  if (!currentPrison) {
    errors = [
      makeErrorObject({
        id: 'currentPrison',
        text: 'Select a prison',
      }),
    ]
  }
  if (!errors) {
    valuesToSave = { currentPrison }
  }
  return { errors, valuesToSave }
}
