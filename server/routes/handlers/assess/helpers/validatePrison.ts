import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { isStringValidReferenceData } from '../../../../referenceData'

export const validatePrison = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest } => {
  let errors
  let valuesToSave

  const { currentPrison, currentPrisonInput } = requestBody
  // currentPrison is the value of the hidden select dropdown that's populated by the autocomplete
  // currentPrisonInput is what the user typed into the autocomplete input. It might be a random string and not a valid prison, so needs validating
  const currentPrisonValid = currentPrison && isStringValidReferenceData('prisons', currentPrisonInput)

  if (!currentPrison || !currentPrisonValid) {
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
