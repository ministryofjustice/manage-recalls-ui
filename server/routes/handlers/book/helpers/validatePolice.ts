import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { isStringValidReferenceData } from '../../../../referenceData'
import { formatValidationErrorMessage } from '../../helpers/errorMessages'

export const validatePolice = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest } => {
  let errors
  let valuesToSave

  const { localPoliceForce, localPoliceForceInput } = requestBody
  // localPoliceForce is the value of the hidden select dropdown that's populated by the autocomplete
  // localPoliceForceInput is what the user typed into the autocomplete input. It might be a random string and not a valid policeForces name, so needs validating
  const localPoliceForceInvalidInput = Boolean(
    localPoliceForceInput && !isStringValidReferenceData('policeForces', localPoliceForceInput)
  )

  if (!localPoliceForce || localPoliceForceInvalidInput) {
    errors = []
    if (localPoliceForceInvalidInput) {
      errors.push(
        makeErrorObject({
          id: 'localPoliceForce',
          text: formatValidationErrorMessage({ errorId: 'invalidSelectionFromList' }, 'a local police force'),
          values: localPoliceForceInput,
        })
      )
    } else if (!localPoliceForce) {
      errors.push(
        makeErrorObject({
          id: 'localPoliceForce',
          text: formatValidationErrorMessage({ errorId: 'noSelectionFromList' }, 'a local police force'),
        })
      )
    }
  }
  if (!errors) {
    valuesToSave = {
      localPoliceForceId: localPoliceForce,
      localPoliceForce: localPoliceForceInput,
    } as UpdateRecallRequest
  }
  return { errors, valuesToSave }
}
