import { makeErrorObject, makeUrl } from '../../helpers'
import { ObjectMap, ReqValidatorReturn, UrlInfo } from '../../../../@types'
import { errorMsgProvideDetail } from '../../helpers/errorMessages'
import { reasonForRecall } from '../../../../referenceData'

export const validateLicence = ({
  requestBody,
  urlInfo,
}: {
  requestBody?: ObjectMap<string | string[]>
  urlInfo?: UrlInfo
}): ReqValidatorReturn => {
  let errors
  let unsavedValues
  let valuesToSave

  const { licenceConditionsBreached, reasonsForRecall, reasonsForRecallOtherDetail } = requestBody
  let reasonsForRecallList: string[] | string = reasonsForRecall
  if (reasonsForRecall && !Array.isArray(reasonsForRecall)) {
    reasonsForRecallList = [reasonsForRecall]
  }
  const noOtherDetail =
    Array.isArray(reasonsForRecallList) &&
    reasonsForRecallList?.includes(reasonForRecall.OTHER) &&
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
      reasonsForRecall: reasonsForRecallList as reasonForRecall[],
      reasonsForRecallOtherDetail: reasonsForRecallOtherDetail as string,
    }
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: makeUrl(urlInfo.fromPage || 'assess-prison', urlInfo) }
}
