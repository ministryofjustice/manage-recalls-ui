import { NamedFormError, ObjectMap } from '../../../../@types'
import { errorMsgProvideDetail, makeErrorObject } from '../../../utils/errorMessages'
import { GenerateDocumentRequest } from '../../../../@types/manage-recalls-api/models/GenerateDocumentRequest'
import { getGeneratedDocumentFileName } from '../helpers'

export const validateGeneratedDocumentVersion = async ({
  requestBody,
  recallId,
  token,
}: {
  requestBody: ObjectMap<string>
  recallId: string
  token: string
}): Promise<{
  errors?: NamedFormError[]
  valuesToSave: GenerateDocumentRequest
  unsavedValues: ObjectMap<unknown>
}> => {
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
    const cat = category as GenerateDocumentRequest.category
    const fileName = await getGeneratedDocumentFileName({ category: cat, recallId, token })
    valuesToSave = { details, category: cat, fileName }
  }
  return { errors, valuesToSave, unsavedValues }
}
