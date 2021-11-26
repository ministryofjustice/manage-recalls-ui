import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'

export const validateLicenceName = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest; unsavedValues: ObjectMap<unknown> } => {
  let errors
  let unsavedValues
  let valuesToSave

  const { licenceNameCategory } = requestBody
  if (!licenceNameCategory) {
    errors = []
    if (!licenceNameCategory) {
      errors.push(
        makeErrorObject({
          id: 'licenceNameCategory',
          text: "How does {{ recall.fullName }}'s name appear on the licence?",
        })
      )
    }
    unsavedValues = {
      licenceNameCategory,
    }
  }
  if (!errors) {
    valuesToSave = {
      licenceNameCategory: licenceNameCategory as UpdateRecallRequest.licenceNameCategory,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
