import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'
import { makeErrorObject } from '../../utils/errorMessages'

export const validateRecallType = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let valuesToSave

  const { recommendedRecallType } = requestBody
  if (!recommendedRecallType) {
    errors = [
      makeErrorObject({
        id: 'recommendedRecallType',
        text: 'What type of recall is being recommended?',
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      recommendedRecallType: recommendedRecallType as UpdateRecallRequest.recallType,
    }
  }
  return {
    errors,
    valuesToSave,
    redirectToPage: urlInfo.fromPage
      ? makeUrlToFromPage(urlInfo.fromPage, urlInfo)
      : makeUrl('request-received', urlInfo),
  }
}
