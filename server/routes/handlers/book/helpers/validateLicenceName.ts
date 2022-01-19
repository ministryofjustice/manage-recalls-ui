import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ObjectMap, ReqValidatorReturn } from '../../../../@types'

export const validateLicenceName = (requestBody: ObjectMap<string>): ReqValidatorReturn => {
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
  return { errors, valuesToSave }
}
