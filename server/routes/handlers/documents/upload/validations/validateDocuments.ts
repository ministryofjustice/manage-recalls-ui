import { listToString, makeErrorObject } from '../../../helpers'
import { allowedDocumentFileExtensions } from '../helpers/allowedUploadExtensions'
import { documentCategories } from '../../documentCategories'
import { CategorisedFileMetadata, UploadedFileMetadata } from '../../../../../@types/documents'
import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { AllowedUploadFileType, NamedFormError } from '../../../../../@types'
import { formatDocLabel } from '../helpers'

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

export const validateCategories = (
  categorisedFileData: CategorisedFileMetadata[]
): {
  errors?: NamedFormError[]
  valuesToSave: CategorisedFileMetadata[]
} => {
  let errors: NamedFormError[]
  let valuesToSave: CategorisedFileMetadata[]
  const usedCategories = [] as string[]
  categorisedFileData?.forEach(file => {
    let hasError = false
    if (usedCategories.includes(file.category)) {
      errors = errors || []
      errors.push(
        makeErrorObject({
          id: file.documentId,
          text: `You can only upload one ${formatDocLabel(file.category)}`,
        })
      )
      hasError = true
    }
    const docCategory = documentCategories.find(cat => cat.name === file.category)
    if (!docCategory) {
      throw new Error(`Invalid document category: ${file.category} for file "${file.fileName}"`)
    }
    if (!docCategory.multiple) {
      usedCategories.push(file.category)
    }
    if (file.category === RecallDocument.category.UNCATEGORISED) {
      errors = errors || []
      errors.push(
        makeErrorObject({
          id: file.documentId,
          text: `Choose a type for ${file.fileName}`,
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
