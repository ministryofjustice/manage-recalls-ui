import { FileDataBase64, NamedFormError, UploadDocumentMetadata, UploadedFormFields } from '../../../../@types'
import { documentCategories } from '../documentCategories'
import { AddDocumentResponse } from '../../../../@types/manage-recalls-api'
import { makeErrorObject } from '../../helpers'

export const makeMetaDataForFile = (key: string, file: Express.Multer.File): FileDataBase64 => {
  const documentCategory = documentCategories.find(doc => doc.name === key)
  return {
    originalFileName: file.originalname,
    mimeType: file.mimetype,
    label: documentCategory.label,
    labelLowerCase: documentCategory.labelLowerCase,
    category: documentCategory.name,
    fileContent: file.buffer.toString('base64'),
  }
}

export const makeMetaDataForFiles = (uploadedFormFields: UploadedFormFields): FileDataBase64[] => {
  const fileData = [] as FileDataBase64[]
  Object.entries(uploadedFormFields).forEach(([key, files]) => {
    files.forEach(file => {
      fileData.push(makeMetaDataForFile(key, file))
    })
  })
  return fileData
}

export const mandatoryDocs = (): UploadDocumentMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document' && doc.required)

export const listFailedUploads = (
  fileData: FileDataBase64[],
  responses: PromiseSettledResult<AddDocumentResponse>[]
): NamedFormError[] | null =>
  responses
    .map((result, idx) => {
      if (result.status === 'rejected') {
        return makeErrorObject({
          id: fileData[idx].category,
          text: `The ${
            fileData[idx].labelLowerCase || fileData[idx].label.toLowerCase()
          } could not be uploaded - try again`,
        })
      }
      return null
    })
    .filter(Boolean)
