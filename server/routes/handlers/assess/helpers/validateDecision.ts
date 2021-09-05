import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ObjectMap, ReqValidatorReturn } from '../../../../@types'

export const validateDecision = (requestBody: ObjectMap<string>): ReqValidatorReturn => {
  let errors
  let unsavedValues
  let valuesToSave

  const { agreeWithRecall, agreeWithRecallDetailYes, agreeWithRecallDetailNo } = requestBody
  const isAgreeValueValid = ['YES', 'NO_STOP'].includes(agreeWithRecall)
  const isYes = agreeWithRecall === 'YES'
  const isNo = agreeWithRecall === 'NO_STOP'
  const yesDetailMissing = isYes && !agreeWithRecallDetailYes
  const noDetailMissing = isNo && !agreeWithRecallDetailNo
  if (!isAgreeValueValid || yesDetailMissing || noDetailMissing) {
    errors = []
    if (!isAgreeValueValid) {
      errors.push(
        makeErrorObject({
          id: 'agreeWithRecall',
          text: 'Do you agree with the recall recommendation?',
        })
      )
    }
    if (yesDetailMissing) {
      errors.push(
        makeErrorObject({
          id: 'agreeWithRecallDetailYes',
          text: 'Provide detail on your decision',
        })
      )
    }
    if (noDetailMissing) {
      errors.push(
        makeErrorObject({
          id: 'agreeWithRecallDetailNo',
          text: 'Provide detail on your decision',
        })
      )
    }
    unsavedValues = {
      agreeWithRecall,
      agreeWithRecallDetailYes,
      agreeWithRecallDetailNo,
    }
  }
  if (!errors) {
    const detail = isYes ? agreeWithRecallDetailYes : agreeWithRecallDetailNo
    valuesToSave = {
      agreeWithRecall: UpdateRecallRequest.agreeWithRecall[agreeWithRecall],
      agreeWithRecallDetail: detail,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
