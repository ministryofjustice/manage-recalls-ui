import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'
import { errorMsgProvideDetail } from '../../helpers/errorMessages'

export const validateLicence = (
  requestBody: ObjectMap<unknown>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest; unsavedValues: ObjectMap<unknown> } => {
  let errors
  let unsavedValues
  let valuesToSave

  const { licenceConditionsBreached, reasonsForRecall, reasonsForRecallOtherDetail } = requestBody
  let reasonsForRecallList = reasonsForRecall
  if (reasonsForRecall && !Array.isArray(reasonsForRecall)) {
    reasonsForRecallList = [reasonsForRecall]
  }
  const noOtherDetail =
    Array.isArray(reasonsForRecallList) &&
    reasonsForRecallList?.includes(RecallResponse.reasonForRecall.OTHER) &&
    !reasonsForRecallOtherDetail
  if (!licenceConditionsBreached || !reasonsForRecall || noOtherDetail) {
    errors = []
    if (!licenceConditionsBreached) {
      errors.push(
        makeErrorObject({
          id: 'licenceConditionsBreached',
          text: 'Enter the licence conditions breached',
        })
      )
    }
    if (!reasonsForRecall) {
      errors.push(
        makeErrorObject({
          id: 'reasonsForRecall',
          text: 'Select reasons for recall',
        })
      )
    }
    if (noOtherDetail) {
      errors.push(
        makeErrorObject({
          id: 'reasonsForRecallOtherDetail',
          text: errorMsgProvideDetail,
        })
      )
    }
    unsavedValues = {
      licenceConditionsBreached,
      reasonsForRecall: reasonsForRecallList,
      reasonsForRecallOtherDetail,
    }
  }
  if (!errors) {
    valuesToSave = {
      licenceConditionsBreached: licenceConditionsBreached as string,
      reasonsForRecall: reasonsForRecallList as RecallResponse.reasonForRecall[],
      reasonsForRecallOtherDetail: reasonsForRecallOtherDetail as string,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
