import { FileDataBase64, UploadError, UploadedFormFields, UploadDocumentMetadata } from '../../../../@types'
import { documentTypes } from '../documentTypes'
import { AddDocumentResponse } from '../../../../@types/manage-recalls-api'

export const addErrorsToDocuments = (errors?: UploadError[]): UploadDocumentMetadata[] => {
  if (!errors) {
    return [...documentTypes]
  }
  return documentTypes.map(doc => {
    const matchedErr = errors.find((err: UploadError) => err.name === doc.name)
    if (matchedErr) {
      return { ...doc, error: matchedErr.text }
    }
    return { ...doc }
  })
}

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
