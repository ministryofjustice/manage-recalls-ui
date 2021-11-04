import { listToString, makeErrorObject } from '../../helpers'
import { allowedDocumentFileExtensions } from '../../helpers/allowedUploadExtensions'
import { documentCategories } from '../../helpers/documents/documentCategories'
import { CategorisedFileMetadata, UploadedFileMetadata } from '../../../../@types/documents'
import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { AllowedUploadFileType, NamedFormError } from '../../../../@types'
import { formatDocLabel } from '../../helpers/documents'

export const isInvalidFileType = (file: UploadedFileMetadata, allowedExtensions: AllowedUploadFileType[]) => {
  return !allowedExtensions.some(ext => file.originalFileName.endsWith(ext.extension) && file.mimeType === ext.mimeType)
}

export const validateUploadedFileTypes = (uploadedFileData: UploadedFileMetadata[]) => {
  let errors: NamedFormError[]
  let valuesToSave: UploadedFileMetadata[]
  uploadedFileData.forEach(file => {
    if (isInvalidFileType(file, allowedDocumentFileExtensions)) {
      errors = errors || []
      errors.push(
        makeErrorObject({
          id: 'documents',
          text: `The selected file '${file.originalFileName}' must be a ${listToString(
            allowedDocumentFileExtensions.map(ext => ext.label),
            'or'
          )}`,
        })
      )
    } else {
      valuesToSave = valuesToSave || []
      valuesToSave.push(file)
    }
  })
  return { errors, valuesToSave }
}

export const validateCategories = (categorisedFileData: CategorisedFileMetadata[]) => {
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
    if (!docCategory.multiple) {
      usedCategories.push(file.category)
    }
    if (file.category === ApiRecallDocument.category.UNCATEGORISED) {
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
