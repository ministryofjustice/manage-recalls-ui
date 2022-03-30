import { ConfirmationMessage, FormWithDocumentUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { errorMsgEmailUpload, errorMsgProvideDetail, makeErrorObject } from '../../../utils/errorMessages'
import { isInvalidFileType } from '../../upload/helpers/allowedUploadExtensions'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'

export const validateMissingDocuments = ({
  requestBody,
  wasUploadFileReceived,
  uploadFailed,
  file,
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
  const fileName = file?.originalname
  const invalidFileType = wasUploadFileReceived
    ? isInvalidFileType({ file, category: RecallDocument.category.MISSING_DOCUMENTS_EMAIL })
    : false

  const { missingDocumentsDetail } = requestBody

  if (!wasUploadFileReceived || uploadFailed || invalidFileType || !missingDocumentsDetail) {
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
    if (!uploadFailed && invalidFileType) {
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
