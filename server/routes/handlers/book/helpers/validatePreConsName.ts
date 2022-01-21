import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ObjectMap, ReqValidatorReturn } from '../../../../@types'

export const validatePreConsName = (requestBody: ObjectMap<string>): ReqValidatorReturn => {
  let errors
  let unsavedValues
  let valuesToSave

  const { previousConvictionMainNameCategory, previousConvictionMainName } = requestBody
  const isYesOther = previousConvictionMainNameCategory === 'OTHER'
  if (!previousConvictionMainNameCategory || (isYesOther && !previousConvictionMainName)) {
    errors = []
    if (!previousConvictionMainNameCategory) {
      errors.push(
        makeErrorObject({
          id: 'previousConvictionMainNameCategory',
          text: "How does {{ recall.fullName }}'s name appear on the previous convictions sheet (pre-cons)?",
        })
      )
    }
    if (isYesOther && !previousConvictionMainName) {
      errors.push(
        makeErrorObject({
          id: 'previousConvictionMainName',
          text: 'Enter the full name on the pre-cons',
        })
      )
    }
    unsavedValues = {
      previousConvictionMainNameCategory,
      previousConvictionMainName,
    }
  }
  if (!errors) {
    // If someone chooses Yes, and types a response, before choosing No, the response is still sent. This 'cleans' that.
    // Using blanks as server cannot handle nulls and will just not overwrite existing value
    let previousConvictionMainNameCleaned = ''
    if (isYesOther) {
      previousConvictionMainNameCleaned = previousConvictionMainName
    }
    valuesToSave = {
      previousConvictionMainNameCategory:
        previousConvictionMainNameCategory as UpdateRecallRequest.previousConvictionMainNameCategory,
      previousConvictionMainName: previousConvictionMainNameCleaned,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
