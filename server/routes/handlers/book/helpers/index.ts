import { FileDataBase64, NamedFormError, UploadDocumentMetadata, UploadedFormFields } from '../../../../@types'
import { documentTypes } from '../documentTypes'
import { AddDocumentResponse } from '../../../../@types/manage-recalls-api'
import { makeErrorObject } from '../../helpers'

export const makeFileData = (files: UploadedFormFields): FileDataBase64[] => {
  return Object.entries(files).map(([key, [value]]) => {
    const documentType = documentTypes.find(doc => doc.name === key)
    return {
      originalFileName: value.originalname,
      mimeType: value.mimetype,
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
): NamedFormError[] | null =>
  responses
    .map((result, idx) => {
      if (result.status === 'rejected') {
        return makeErrorObject({
          id: fileData[idx].category,
          text: `${fileData[idx].label} - an error occurred during upload`,
        })
      }
      return null
    })
    .filter(Boolean)
