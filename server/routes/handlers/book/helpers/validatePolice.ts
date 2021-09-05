import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'

export const validatePolice = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest } => {
  let errors
  let valuesToSave

  const { localPoliceForce } = requestBody
  if (!localPoliceForce) {
    errors = [
      makeErrorObject({
        id: 'localPoliceForce',
        text: 'Local police force',
        values: { localPoliceForce },
      }),
    ]
  }
  if (!errors) {
    valuesToSave = { localPoliceForce }
  }
  return { errors, valuesToSave }
}
