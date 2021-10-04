import { makeErrorObject } from '../../helpers'
import { FileDataBase64, NamedFormError, ObjectMap } from '../../../../@types'
import { allowedDocumentFileExtensions } from '../../helpers/allowedUploadExtensions'
import { documentTypes } from '../documentTypes'

interface Args {
  fileData: FileDataBase64[]
  requestBody: ObjectMap<string>
}

const invalidFileFormat = (file: FileDataBase64) => {
  return !allowedDocumentFileExtensions.some(
    ext => file.originalFileName.endsWith(ext.extension) && file.mimeType === ext.mimeType
  )
}

export const validateUploadDocuments = ({ fileData, requestBody }: Args): { errors?: NamedFormError[] } => {
  const validationErrors = documentTypes
    .map(docType => {
      const uploadedFile = fileData.find(file => file.category === docType.name)
      if (docType.required && !uploadedFile && !requestBody[docType.name]) {
        return makeErrorObject({
          id: docType.name,
          text: `Select a ${docType.label}`,
        })
      }
      if (uploadedFile && invalidFileFormat(uploadedFile)) {
        return makeErrorObject({
          id: uploadedFile.category,
          text: `${uploadedFile.label} must be a ${allowedDocumentFileExtensions
            .map(ext => ext.extension)
            .join(' or ')}`,
        })
      }
      return undefined
    })
    .filter(Boolean)
  return { errors: validationErrors.length ? validationErrors : undefined }
}
