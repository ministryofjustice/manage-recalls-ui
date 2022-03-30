import { isInvalidFileType } from '../helpers/allowedUploadExtensions'
import { UploadedFileMetadata } from '../../../../@types/documents'
import { NamedFormError } from '../../../../@types'
import { errorMsgDocumentUpload, makeErrorObject } from '../../../utils/errorMessages'
import { MAX_UPLOAD_FILE_SIZE_MB } from '../helpers'

export const isFileSizeTooLarge = (file: UploadedFileMetadata) => file.sizeMB > MAX_UPLOAD_FILE_SIZE_MB

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
    const invalidFileType = isInvalidFileType({ file: files[idx], category: fileData.category })
    let hasError = invalidFileType || isFileSizeTooLarge(fileData)
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
      if (isFileSizeTooLarge(fileData)) {
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
      const { sizeMB, ...rest } = fileData
      valuesToSave = valuesToSave || []
      valuesToSave.push(rest)
    }
  })
  return { errors, valuesToSave }
}
