import { makeErrorObject } from '../../helpers'
import { FileDataBase64, NamedFormError } from '../../../../@types'
import { allowedDocumentFileExtensions } from '../../helpers/allowedUploadExtensions'
import { documentCategories } from '../documentCategories'

interface Args {
  fileData: FileDataBase64[]
}

const invalidFileFormat = (file: FileDataBase64) => {
  return !allowedDocumentFileExtensions.some(
    ext => file.originalFileName.endsWith(ext.extension) && file.mimeType === ext.mimeType
  )
}

export const validateUploadDocuments = ({ fileData }: Args): { errors?: NamedFormError[] } => {
  const validationErrors = documentCategories
    .map(docType => {
      const uploadedFile = fileData.find(file => file.category === docType.name)
      const label = docType.labelLowerCase || docType.label.toLowerCase()
      if (uploadedFile && invalidFileFormat(uploadedFile)) {
        return makeErrorObject({
          id: uploadedFile.category,
          text: `The ${label} must be a ${allowedDocumentFileExtensions.map(ext => ext.label).join(' or ')}`,
        })
      }
      return undefined
    })
    .filter(Boolean)
  return { errors: validationErrors.length ? validationErrors : undefined }
}
