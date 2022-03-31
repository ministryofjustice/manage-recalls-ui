import { isInvalidFileType } from '../helpers/allowedUploadExtensions'
import { UploadedFileMetadata } from '../../../../@types/documents'
import { NamedFormError } from '../../../../@types'
import { errorMsgDocumentUpload, makeErrorObject } from '../../../utils/errorMessages'
import { isFileSizeTooLarge } from '../helpers'

export const validateUploadedFiles = ({
  files,
  uploadedFileData,
  fileUploadInputName,
}: {
  files: Express.Multer.File[]
  uploadedFileData: UploadedFileMetadata[]
  fileUploadInputName: string
}): {
  errors?: NamedFormError[]
  valuesToSave: UploadedFileMetadata[]
} => {
  let errors: NamedFormError[]
  let valuesToSave: UploadedFileMetadata[]
  uploadedFileData.forEach((fileData, idx) => {
    const file = files[idx]
    const invalidFileType = isInvalidFileType({ file, category: fileData.category })
    let hasError = invalidFileType || isFileSizeTooLarge(file.size)
    if (hasError) {
      errors = errors || []
      if (invalidFileType) {
        errors.push(
          makeErrorObject({
            id: fileUploadInputName,
            text: errorMsgDocumentUpload.invalidFileFormat(fileData.originalFileName),
          })
        )
      }
      if (isFileSizeTooLarge(file.size)) {
        errors.push(
          makeErrorObject({
            id: fileUploadInputName,
            text: errorMsgDocumentUpload.invalidFileSize(fileData.originalFileName),
          })
        )
      }
      hasError = true
    }
    if (!hasError) {
      valuesToSave = valuesToSave || []
      valuesToSave.push(fileData)
    }
  })
  return { errors, valuesToSave }
}
