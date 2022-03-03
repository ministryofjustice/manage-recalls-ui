// special case with Fixed / Standard options, each with a detail field in the front end
// whichever option is selected, its detail field is stored as confirmedRecallTypeDetail in the API
import { RecallResponse } from '../../@types/manage-recalls-api'
import { isDefined } from '../../utils/utils'
import { GetFormValuesArgs } from './getFormValues'

interface ReturnVals {
  confirmedRecallTypeDetailFixed?: string
  confirmedRecallTypeDetailStandard?: string
}

export const confirmRecallTypeDetailFields = ({
  confirmedRecallType,
  errors = {},
  unsavedValues = {},
  apiValues,
}: GetFormValuesArgs & { confirmedRecallType?: RecallResponse.recommendedRecallType }): ReturnVals => {
  const vals = {} as ReturnVals
  if (confirmedRecallType === 'FIXED') {
    vals.confirmedRecallTypeDetailFixed = isDefined(errors.confirmedRecallTypeDetailFixed)
      ? ''
      : (unsavedValues.confirmedRecallTypeDetailFixed as string) ||
        (apiValues.confirmedRecallType === 'FIXED' && apiValues.confirmedRecallTypeDetail)
  } else if (confirmedRecallType === 'STANDARD') {
    vals.confirmedRecallTypeDetailStandard = isDefined(errors.confirmedRecallTypeDetailStandard)
      ? ''
      : (unsavedValues.confirmedRecallTypeDetailStandard as string) ||
        (apiValues.confirmedRecallType === 'STANDARD' && apiValues.confirmedRecallTypeDetail)
  }
  return vals
}
