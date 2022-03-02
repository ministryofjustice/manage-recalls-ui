import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'
import { makeErrorObject } from '../../utils/errorMessages'
import { RecommendedRecallTypeRequest } from '../../../@types/manage-recalls-api/models/RecommendedRecallTypeRequest'

export const validateRecallType = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<RecommendedRecallTypeRequest> => {
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
      recommendedRecallType: recommendedRecallType as RecommendedRecallTypeRequest.recommendedRecallType,
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
