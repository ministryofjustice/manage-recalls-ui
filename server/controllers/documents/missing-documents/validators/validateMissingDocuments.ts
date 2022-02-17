import { EmailUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { errorMsgEmailUpload, errorMsgProvideDetail, makeErrorObject } from '../../../utils/errorMessages'

export const validateMissingDocuments = ({
  requestBody,
  emailFileSelected,
  uploadFailed,
  invalidFileFormat,
}: EmailUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave: { missingDocumentsDetail: string }
  unsavedValues: ObjectMap<unknown>
} => {
  let errors
  let valuesToSave
  const { missingDocumentsDetail } = requestBody

  if (!emailFileSelected || uploadFailed || invalidFileFormat || !missingDocumentsDetail) {
    errors = []
    if (!emailFileSelected) {
      errors.push(
        makeErrorObject({
          id: 'missingDocumentsEmailFileName',
          text: errorMsgEmailUpload.noFile,
        })
      )
    }
    if (uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'missingDocumentsEmailFileName',
          text: errorMsgEmailUpload.uploadFailed,
        })
      )
    }
    if (!uploadFailed && invalidFileFormat) {
      errors.push(
        makeErrorObject({
          id: 'missingDocumentsEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat,
        })
      )
    }
    if (!missingDocumentsDetail) {
      errors.push(
        makeErrorObject({
          id: 'missingDocumentsDetail',
          text: errorMsgProvideDetail,
        })
      )
    }
  }
  const unsavedValues = {
    missingDocumentsDetail,
  }
  if (!errors) {
    valuesToSave = { missingDocumentsDetail }
  }
  return { errors, valuesToSave, unsavedValues }
}
