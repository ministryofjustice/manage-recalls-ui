import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { isStringValidReferenceData } from '../../../../referenceData'

export const validatePolice = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest } => {
  let errors
  let valuesToSave

  const { localPoliceForce, localPoliceForceInput } = requestBody
  // localPoliceForce is the value of the hidden select dropdown that's populated by the autocomplete
  // localPoliceForceInput is what the user typed into the autocomplete input. It might be a random string and not a valid policeForces name, so needs validating
  const localPoliceForceValid = localPoliceForce && isStringValidReferenceData('policeForces', localPoliceForceInput)

  if (!localPoliceForce || !localPoliceForceValid) {
    errors = [
      makeErrorObject({
        id: 'localPoliceForce',
        text: 'Select a local police force',
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      localPoliceForceId: localPoliceForce,
      localPoliceForce: localPoliceForceInput,
    } as UpdateRecallRequest
  }
  return { errors, valuesToSave }
}
