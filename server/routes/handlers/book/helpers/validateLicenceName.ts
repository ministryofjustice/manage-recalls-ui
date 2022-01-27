import { makeErrorObject, makeUrl } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'

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
  return { errors, valuesToSave, redirectToPage: makeUrl(urlInfo.fromPage || 'pre-cons-name', urlInfo) }
}
