import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'
import { makeErrorObject } from '../../utils/errorMessages'

export const validatePreConsName = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let unsavedValues
  let valuesToSave

  const { previousConvictionMainNameCategory, previousConvictionMainName, hasExistingPreviousConvictionMainName } =
    requestBody
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
    // in the case of no detail, only send an empty string to reset the detail field, if it has an existing value
    const previousConvictionMainNameIfNotOther = hasExistingPreviousConvictionMainName ? '' : undefined
    valuesToSave = {
      previousConvictionMainNameCategory:
        previousConvictionMainNameCategory as UpdateRecallRequest.previousConvictionMainNameCategory,
      previousConvictionMainName: isYesOther ? previousConvictionMainName : previousConvictionMainNameIfNotOther,
    }
  }
  return {
    errors,
    valuesToSave,
    unsavedValues,
    redirectToPage: urlInfo.fromPage
      ? makeUrlToFromPage(urlInfo.fromPage, urlInfo)
      : makeUrl('custody-status', urlInfo),
  }
}
