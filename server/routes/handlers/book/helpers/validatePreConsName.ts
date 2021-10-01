import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'

export const validatePreConsName = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest; unsavedValues: ObjectMap<unknown> } => {
  let errors
  let unsavedValues
  let valuesToSave

  const { hasOtherPreviousConvictionMainName, previousConvictionMainName } = requestBody
  const isYes = hasOtherPreviousConvictionMainName === 'YES'
  if (!hasOtherPreviousConvictionMainName || (isYes && !previousConvictionMainName)) {
    errors = []
    if (!hasOtherPreviousConvictionMainName) {
      errors.push(
        makeErrorObject({
          id: 'hasOtherPreviousConvictionMainName',
          text: "Is {{person.firstName}} {{person.lastName}}'s name different on the previous convictions report (pre-cons)?",
        })
      )
    }
    if (isYes && !previousConvictionMainName) {
      errors.push(
        makeErrorObject({
          id: 'previousConvictionMainName',
          text: 'Enter the name on the pre-cons',
        })
      )
    }
    unsavedValues = {
      hasOtherPreviousConvictionMainName,
      previousConvictionMainName,
    }
  }
  if (!errors) {
    // If someone chooses Yes, and types a response, before choosing No, the response is still sent. This 'cleans' that.
    // Using blanks as server cannot handle nulls and will just not overwrite existing value
    const previousConvictionMainNameCleaned = isYes ? previousConvictionMainName : ''
    valuesToSave = {
      hasOtherPreviousConvictionMainName: isYes,
      previousConvictionMainName: previousConvictionMainNameCleaned,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
