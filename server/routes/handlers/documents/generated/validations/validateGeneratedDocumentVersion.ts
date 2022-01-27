import { makeErrorObject } from '../../../helpers'
import { NamedFormError, ObjectMap } from '../../../../../@types'
import { errorMsgProvideDetail } from '../../../helpers/errorMessages'
import { GenerateDocumentRequest } from '../../../../../@types/manage-recalls-api/models/GenerateDocumentRequest'

export const validateGeneratedDocumentVersion = ({
  requestBody,
}: {
  requestBody: ObjectMap<string>
}): {
  errors?: NamedFormError[]
  valuesToSave: GenerateDocumentRequest
  unsavedValues: ObjectMap<unknown>
} => {
  let errors
  let valuesToSave
  let unsavedValues
  const { details, category } = requestBody

  if (!details) {
    errors = []
    if (!details) {
      errors.push(
        makeErrorObject({
          id: 'details',
          text: errorMsgProvideDetail,
        })
      )
    }
  }
  if (errors) {
    unsavedValues = {
      details,
    }
  } else {
    valuesToSave = { details, category: category as GenerateDocumentRequest.category }
  }
  return { errors, valuesToSave, unsavedValues }
}
