import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'
import { makeErrorObject } from '../../utils/errorMessages'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'

export const validateSupportRerelease = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let valuesToSave
  let redirectToPage

  const { rereleaseSupported } = requestBody
  if (!rereleaseSupported || !['YES', 'NO'].includes(rereleaseSupported)) {
    errors = [
      makeErrorObject({
        id: 'rereleaseSupported',
        text: 'Do probation support re-release?',
      }),
    ]
  }
  if (!errors) {
    redirectToPage = urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl('view-recall', urlInfo)
    valuesToSave = {
      rereleaseSupported: rereleaseSupported === 'YES',
    }
  }
  return { errors, valuesToSave, redirectToPage }
}
