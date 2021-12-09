import { listToString, makeErrorObject } from '../../../helpers'
import { allowedDocumentFileExtensions } from '../helpers/allowedUploadExtensions'
import { UploadedFileMetadata } from '../../../../../@types/documents'
import { AllowedUploadFileType, NamedFormError } from '../../../../../@types'

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
          text: `The selected file '${file.originalFileName}' must be a ${listToString(
            allowedDocumentFileExtensions.map(ext => ext.label),
            'or'
          )}`,
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
