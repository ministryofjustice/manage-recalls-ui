import {
  allowedDocumentFileExtensions,
  allowedEmailFileExtensions,
  allowedNoteFileExtensions,
} from '../helpers/allowedUploadExtensions'
import { DocumentType, UploadedFileMetadata } from '../../../../@types/documents'
import { NamedFormError } from '../../../../@types'
import { errorMsgDocumentUpload, makeErrorObject } from '../../../utils/errorMessages'
import { findDocCategory, MAX_UPLOAD_FILE_SIZE_MB } from '../helpers'

export const isInvalidFileType = (file: UploadedFileMetadata) => {
  const docCategory = findDocCategory(file.category)
  const allowedExtensions = allowedExtensionsForFileType(docCategory.type)
  return !allowedExtensions.some(
    ext =>
      file.originalFileName.endsWith(ext.extension) && (file.mimeType === ext.mimeType || ext.allowAnyMimeType === true)
  )
}

const allowedExtensionsForFileType = (fileType: DocumentType) => {
  switch (fileType) {
    case 'document':
      return allowedDocumentFileExtensions
    case 'email':
      return allowedEmailFileExtensions
    case 'note_document':
      return allowedNoteFileExtensions
    default:
      throw new Error(`Invalid file type: ${fileType}`)
  }
}

export const isFileSizeTooLarge = (file: UploadedFileMetadata) => file.sizeMB > MAX_UPLOAD_FILE_SIZE_MB

export const validateUploadedFiles = (
  uploadedFileData: UploadedFileMetadata[],
  fileUploadInputName: string
): {
  errors?: NamedFormError[]
  valuesToSave: UploadedFileMetadata[]
} => {
  let errors: NamedFormError[]
  let valuesToSave: UploadedFileMetadata[]
  uploadedFileData.forEach(file => {
    let hasError = isInvalidFileType(file) || isFileSizeTooLarge(file)
    if (hasError) {
      errors = errors || []
      if (isInvalidFileType(file)) {
        errors.push(
          makeErrorObject({
            id: fileUploadInputName,
            text: errorMsgDocumentUpload.invalidFileFormat(file.originalFileName),
          })
        )
      }
      if (isFileSizeTooLarge(file)) {
        errors.push(
          makeErrorObject({
            id: fileUploadInputName,
            text: errorMsgDocumentUpload.invalidFileSize(file.originalFileName),
          })
        )
      }
      hasError = true
    }
    if (!hasError) {
      const { sizeMB, ...rest } = file
      valuesToSave = valuesToSave || []
      valuesToSave.push(rest)
    }
  })
  return { errors, valuesToSave }
}
