import { makeErrorObject } from '../../helpers'
import { ObjectMap, ReqValidatorReturn, UrlInfo } from '../../../../@types'
import { errorMsgProvideDetail } from '../../helpers/errorMessages'
import { reasonForRecall } from '../../../../referenceData'
import { makeUrl, makeUrlToFromPage } from '../../helpers/makeUrl'

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
  let redirectToPage

  const {
    licenceConditionsBreached,
    reasonsForRecall,
    reasonsForRecallOtherDetail,
    inCustody,
    hasExistingReasonsForRecallOtherDetail,
  } = requestBody
  let reasonsForRecallList: string[] | string = reasonsForRecall
  if (reasonsForRecall && !Array.isArray(reasonsForRecall)) {
    reasonsForRecallList = [reasonsForRecall]
  }
  const otherSelected = Array.isArray(reasonsForRecallList) && reasonsForRecallList?.includes(reasonForRecall.OTHER)
  const noOtherDetail = otherSelected && !reasonsForRecallOtherDetail
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
    // in the case of Other not being selected, only send an empty string to reset the Other detail field, if it has an existing value
    const otherDetailIfNotSelected = hasExistingReasonsForRecallOtherDetail ? '' : undefined
    valuesToSave = {
      licenceConditionsBreached: licenceConditionsBreached as string,
      reasonsForRecall: reasonsForRecallList as reasonForRecall[],
      reasonsForRecallOtherDetail: otherSelected ? (reasonsForRecallOtherDetail as string) : otherDetailIfNotSelected,
    }
    redirectToPage = makeUrl(inCustody ? 'assess-prison' : 'assess-custody-status', urlInfo)
    if (urlInfo.fromPage) {
      redirectToPage = makeUrlToFromPage(urlInfo.fromPage, urlInfo)
    }
  }
  return {
    errors,
    valuesToSave,
    unsavedValues,
    redirectToPage,
  }
}
