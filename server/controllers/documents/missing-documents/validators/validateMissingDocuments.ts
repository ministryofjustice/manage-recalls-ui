import { ConfirmationMessage, FormWithDocumentUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { errorMsgEmailUpload, errorMsgProvideDetail, makeErrorObject } from '../../../utils/errorMessages'
import { isInvalidEmailFileName } from '../../upload/helpers/allowedUploadExtensions'

export const validateMissingDocuments = ({
  requestBody,
  wasUploadFileReceived,
  uploadFailed,
  fileName,
}: FormWithDocumentUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave: { missingDocumentsDetail: string }
  unsavedValues: ObjectMap<unknown>
  redirectToPage: string
  confirmationMessage?: ConfirmationMessage
} => {
  let errors
  let valuesToSave
  let confirmationMessage
  const invalidFileName = isInvalidEmailFileName(fileName)
  const { missingDocumentsDetail } = requestBody

  if (!wasUploadFileReceived || uploadFailed || invalidFileName || !missingDocumentsDetail) {
    errors = []
    if (!wasUploadFileReceived) {
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
    if (!uploadFailed && invalidFileName) {
      errors.push(
        makeErrorObject({
          id: 'missingDocumentsEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat(fileName),
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
    confirmationMessage = {
      text: 'Chase note added.',
      link: {
        text: 'View',
        href: '#missing-documents',
      },
      type: 'success',
    }
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: 'check-answers', confirmationMessage }
}
