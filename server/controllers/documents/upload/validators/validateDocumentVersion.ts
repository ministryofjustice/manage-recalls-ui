import { allowedDocumentFileExtensions } from '../helpers/allowedUploadExtensions'
import { AllowedUploadFileType, UploadedFileMetadata } from '../../../../@types/documents'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { errorMsgDocumentUpload, errorMsgProvideDetail, makeErrorObject } from '../../../utils/errorMessages'

export const isInvalidFileType = (file: UploadedFileMetadata, allowedExtensions: AllowedUploadFileType[]) => {
  return !allowedExtensions.some(ext => file.originalFileName.endsWith(ext.extension) && file.mimeType === ext.mimeType)
}

export const validateDocumentVersion = (
  uploadedFileData: UploadedFileMetadata,
  requestBody: ObjectMap<string>,
  uploadFailed: boolean
): {
  errors?: NamedFormError[]
  valuesToSave: UploadedFileMetadata[]
} => {
  let errors: NamedFormError[]
  let valuesToSave: UploadedFileMetadata[]
  const invalidFileFormat = uploadedFileData && isInvalidFileType(uploadedFileData, allowedDocumentFileExtensions)
  if (!uploadedFileData || uploadFailed || invalidFileFormat || !requestBody.details) {
    errors = []
    if (!uploadedFileData) {
      errors = [
        makeErrorObject({
          id: 'document',
          text: errorMsgDocumentUpload.noFile,
        }),
      ]
    }
    if (invalidFileFormat) {
      errors = errors || []
      errors.push(
        makeErrorObject({
          id: 'document',
          text: errorMsgDocumentUpload.invalidFileFormat(uploadedFileData.originalFileName),
        })
      )
    }
    if (!requestBody.details) {
      errors = errors || []
      errors.push(
        makeErrorObject({
          id: 'details',
          text: errorMsgProvideDetail,
        })
      )
    }
  }
  if (!errors) {
    valuesToSave = valuesToSave || []
    valuesToSave.push(uploadedFileData)
  }
  return { errors, valuesToSave }
}
