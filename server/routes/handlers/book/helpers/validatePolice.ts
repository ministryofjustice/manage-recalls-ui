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

  const { localPoliceForceId, localPoliceForceIdInput } = requestBody
  // localPoliceForceId is the value of the hidden select dropdown that's populated by the autocomplete
  // localPoliceForceIdInput is what the user typed into the autocomplete input. It might be a random string and not a valid policeForces name, so needs validating
  const localPoliceForceInvalidInput = Boolean(
    localPoliceForceIdInput && !isStringValidReferenceData('policeForces', localPoliceForceIdInput)
  )

  if (!localPoliceForceId || localPoliceForceInvalidInput) {
    errors = []
    if (localPoliceForceInvalidInput) {
      errors.push(
        makeErrorObject({
          id: 'localPoliceForceId',
          text: formatValidationErrorMessage({ errorId: 'invalidSelectionFromList' }, 'a local police force'),
          values: localPoliceForceIdInput,
        })
      )
    } else if (!localPoliceForceId) {
      errors.push(
        makeErrorObject({
          id: 'localPoliceForceId',
          text: formatValidationErrorMessage({ errorId: 'noSelectionFromList' }, 'a local police force'),
        })
      )
    }
  }
  if (!errors) {
    valuesToSave = {
      localPoliceForceId,
    } as UpdateRecallRequest
  }
  return { errors, valuesToSave }
}
