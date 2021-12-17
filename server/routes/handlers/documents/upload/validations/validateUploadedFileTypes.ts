import { makeErrorObject } from '../../../helpers'
import { allowedDocumentFileExtensions } from '../helpers/allowedUploadExtensions'
import { AllowedUploadFileType, UploadedFileMetadata } from '../../../../../@types/documents'
import { NamedFormError } from '../../../../../@types'
import { errorMsgDocumentUpload } from '../../../helpers/errorMessages'

export const isInvalidFileType = (file: UploadedFileMetadata, allowedExtensions: AllowedUploadFileType[]) => {
  return !allowedExtensions.some(ext => file.originalFileName.endsWith(ext.extension) && file.mimeType === ext.mimeType)
}

export const validateUploadedFileTypes = (
  uploadedFileData: UploadedFileMetadata[],
  fileUploadInputName: string
): {
  errors?: NamedFormError[]
  valuesToSave: UploadedFileMetadata[]
} => {
  let errors: NamedFormError[]
  let valuesToSave: UploadedFileMetadata[]
  uploadedFileData.forEach(file => {
    let hasError = false
    if (isInvalidFileType(file, allowedDocumentFileExtensions)) {
      errors = errors || []
      errors.push(
        makeErrorObject({
          id: fileUploadInputName,
          text: errorMsgDocumentUpload.invalidFileFormat(file.originalFileName),
        })
      )
      hasError = true
    }
    if (!hasError) {
      valuesToSave = valuesToSave || []
      valuesToSave.push(file)
    }
  })
  return { errors, valuesToSave }
}
