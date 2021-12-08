import { NamedFormError, ObjectMap, UrlInfo } from '../../../../../@types'
import { documentCategories } from '../../documentCategories'
import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { AddDocumentResponse } from '../../../../../@types/manage-recalls-api/models/AddDocumentResponse'
import { RecallResponse } from '../../../../../@types/manage-recalls-api/models/RecallResponse'
import { makeErrorObject } from '../../../helpers'
import {
  CategorisedFileMetadata,
  DocumentCategoryMetadata,
  UploadedFileMetadata,
} from '../../../../../@types/documents'
import { addRecallDocument, setDocumentCategory } from '../../../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../../../logger'
import { errorMsgDocumentUpload } from '../../../helpers/errorMessages'

export const makeMetaDataForFile = (
  file: Express.Multer.File,
  categoryName: RecallDocument.category
): UploadedFileMetadata => {
  const documentCategory = findDocCategory(categoryName)
  return {
    originalFileName: file.originalname,
    standardFileName: documentCategory.standardFileName,
    mimeType: file.mimetype,
    label: documentCategory.label,
    labelLowerCase: documentCategory.labelLowerCase,
    category: documentCategory.name,
    fileContent: file.buffer.toString('base64'),
  }
}

export const getMetadataForUploadedFiles = (
  files: Express.Multer.File[],
  categoryName: RecallDocument.category
): UploadedFileMetadata[] => {
  return files ? files.map(file => makeMetaDataForFile(file, categoryName)) : []
}

export const getMetadataForCategorisedFiles = (requestBody: ObjectMap<string>): CategorisedFileMetadata[] => {
  logger.info(`getMetadataForCategorisedFiles: ${JSON.stringify(requestBody)}`)
  const categoryKeys = Object.keys(requestBody).filter(key => key.startsWith('category-'))
  return categoryKeys.map(key => {
    const documentId = key.replace('category-', '')
    return {
      documentId,
      category: requestBody[key] as RecallDocument.category,
      fileName: requestBody[`fileName-${documentId}`], // TODO - log if not found?
    }
  })
}

export const uploadedDocCategoriesList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document')

export const requiredDocsList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document' && doc.required)

export const missingNotRequiredDocsList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document' && doc.hintIfMissing)

export const listMissingRequiredDocs = (docs: RecallDocument[]): string[] => {
  const listOfRequiredAndDesired = [...requiredDocsList(), ...missingNotRequiredDocsList()]
  return listOfRequiredAndDesired
    .map(requiredDocCategory => {
      const uploadedFile = docs.find(doc => doc.category === requiredDocCategory.name)
      return uploadedFile ? undefined : formatDocLabel(requiredDocCategory.name)
    })
    .filter(Boolean)
}

export const listFailedUploads = (
  fileData: UploadedFileMetadata[],
  responses: PromiseSettledResult<AddDocumentResponse>[]
): NamedFormError[] | null =>
  responses
    .map((result, idx) => {
      if (result.status === 'rejected') {
        if (result.reason.data?.message === 'VirusFoundException') {
          return makeErrorObject({
            id: 'documents',
            text: errorMsgDocumentUpload.containsVirus(fileData[idx].originalFileName),
          })
        }
        return makeErrorObject({
          id: 'documents',
          text: errorMsgDocumentUpload.uploadFailed(fileData[idx].originalFileName),
        })
      }
      return null
    })
    .filter(Boolean)

export const listFailedCategorySaves = (
  fileData: CategorisedFileMetadata[],
  responses: PromiseSettledResult<AddDocumentResponse>[]
): NamedFormError[] | null =>
  responses
    .map((result, idx) => {
      if (result.status === 'rejected') {
        return makeErrorObject({
          id: fileData[idx].documentId,
          text: `${fileData[idx].fileName} could not be saved - try again`,
        })
      }
      return null
    })
    .filter(Boolean)

export const saveUploadedFiles = async ({
  uploadsToSave,
  recallId,
  token,
}: {
  uploadsToSave: UploadedFileMetadata[]
  recallId: string
  token: string
}) => {
  if (uploadsToSave?.length) {
    const responses = await Promise.allSettled(
      uploadsToSave.map(file => {
        const { category, fileContent, originalFileName } = file
        return addRecallDocument(recallId, { category, fileContent, fileName: originalFileName }, token)
      })
    )
    return listFailedUploads(uploadsToSave, responses)
  }
  return []
}

export const saveCategories = async ({
  recallId,
  categorisedToSave,
  token,
}: {
  recallId: string
  categorisedToSave: CategorisedFileMetadata[]
  token: string
}) => {
  if (categorisedToSave?.length) {
    const responses = await Promise.allSettled(
      categorisedToSave.map(file => {
        const { documentId, category } = file
        return setDocumentCategory(recallId, documentId, category, token)
      })
    )
    return listFailedCategorySaves(categorisedToSave, responses)
  }
  return []
}

export const formatDocLabel = (category: RecallDocument.category) => {
  const docCategory = documentCategories.find(d => d.name === category)
  return docCategory ? docCategory.labelLowerCase || docCategory.label.toLowerCase() : ''
}

export const enableDeleteDocuments = (recallStatus: RecallResponse.status, urlInfo: UrlInfo) => {
  if (recallStatus !== RecallResponse.status.BEING_BOOKED_ON) {
    return false
  }
  if (urlInfo.fromPage && urlInfo.fromPage !== 'check-answers') {
    return false
  }
  return true
}

export const findDocCategory = (category: RecallDocument.category) =>
  documentCategories.find(cat => cat.name === category)
