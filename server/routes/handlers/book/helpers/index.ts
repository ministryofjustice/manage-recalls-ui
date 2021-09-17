import { FileDataBase64, UploadDocumentMetadata, UploadedFormFields, UploadError } from '../../../../@types'
import { documentTypes } from '../documentTypes'
import { AddDocumentResponse } from '../../../../@types/manage-recalls-api'

export const makeFileData = (files: UploadedFormFields): FileDataBase64[] => {
  return Object.entries(files).map(([key, [value]]) => {
    const documentType = documentTypes.find(doc => doc.name === key)
    return {
      fileName: value.originalname,
      label: documentType.label,
      category: documentType.name,
      fileContent: value.buffer.toString('base64'),
    }
  })
}

export const mandatoryDocs = (): UploadDocumentMetadata[] =>
  documentTypes.filter(doc => doc.type === 'document' && doc.required)

export const listFailedUploads = (
  fileData: FileDataBase64[],
  responses: PromiseSettledResult<AddDocumentResponse>[]
): UploadError[] | null =>
  responses
    .map((result, idx) => {
      if (result.status === 'rejected') {
        return {
          name: fileData[idx].category,
          fileName: fileData[idx].fileName,
          text: `${fileData[idx].fileName} - an error occurred during upload`,
          href: `#${fileData[idx].category}`,
        }
      }
      return null
    })
    .filter(Boolean)
