import {
  allowedDocumentFileExtensions,
  allowedEmailFileExtensions,
  allowedNoteFileExtensions,
} from '../helpers/allowedUploadExtensions'
import { DocumentType, UploadedFileMetadata } from '../../../../@types/documents'
import { NamedFormError } from '../../../../@types'
import { errorMsgDocumentUpload, makeErrorObject } from '../../../utils/errorMessages'
import { findDocCategory } from '../helpers'

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
    if (isInvalidFileType(file)) {
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
