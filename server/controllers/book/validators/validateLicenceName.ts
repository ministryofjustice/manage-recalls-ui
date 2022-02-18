import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'
import { makeErrorObject } from '../../utils/errorMessages'

export const validateLicenceName = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  let errors
  let valuesToSave

  const { licenceNameCategory } = requestBody
  if (!licenceNameCategory) {
    errors = [
      makeErrorObject({
        id: 'licenceNameCategory',
        text: "How does {{ recall.fullName }}'s name appear on the licence?",
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      licenceNameCategory: licenceNameCategory as UpdateRecallRequest.licenceNameCategory,
    }
  }
  return {
    errors,
    valuesToSave,
    redirectToPage: urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl('pre-cons-name', urlInfo),
  }
}
