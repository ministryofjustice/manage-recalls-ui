import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../utils/errorMessages'
import { RecallResponse } from '../../../@types/manage-recalls-api'
import { makeUrlToFromPage } from '../../utils/makeUrl'
import { StopRecallRequest } from '../../../@types/manage-recalls-api/models/StopRecallRequest'

export const validateStopReason = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<StopRecallRequest> => {
  let errors
  let valuesToSave
  let confirmationMessage
  const { stopReason } = requestBody

  if (!stopReason) {
    errors = [
      makeErrorObject({
        id: 'stopReason',
        text: 'Why are you stopping this recall?',
      }),
    ]
  }
  if (!errors) {
    valuesToSave = { stopReason: stopReason as RecallResponse.stopReason }
    confirmationMessage = {
      text: 'Recall stopped.',
      link: {
        text: 'View',
        href: '#recallDetails',
      },
      type: 'success',
    }
  }
  return { errors, valuesToSave, redirectToPage: makeUrlToFromPage(urlInfo.fromPage, urlInfo), confirmationMessage }
}
