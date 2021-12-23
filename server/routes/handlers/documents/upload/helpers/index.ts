import { NamedFormError, UrlInfo } from '../../../../../@types'
import { documentCategories } from '../../documentCategories'
import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { NewDocumentResponse } from '../../../../../@types/manage-recalls-api/models/NewDocumentResponse'
import { RecallResponse } from '../../../../../@types/manage-recalls-api/models/RecallResponse'
import { makeErrorObject } from '../../../helpers'
import { DocumentCategoryMetadata, UploadedFileMetadata } from '../../../../../@types/documents'
import { uploadRecallDocument } from '../../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { errorMsgDocumentUpload } from '../../../helpers/errorMessages'

export const makeMetaDataForFile = (
  file: Express.Multer.File,
  categoryName: RecallDocument.category,
  details?: string
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
    details,
  }
}

export const getMetadataForUploadedFiles = (
  files: Express.Multer.File[],
  categoryName: RecallDocument.category,
  details?: string
): UploadedFileMetadata[] => {
  return files ? files.map(file => makeMetaDataForFile(file, categoryName, details)) : []
}

export const uploadedDocCategoriesList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document')

export const requiredDocsList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document' && doc.required)

export const missingNotRequiredDocsList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document' && doc.hintIfMissing)

export const listMissingRequiredDocs = ({
  docs,
  returnLabels,
}: {
  docs: RecallDocument[]
  returnLabels: boolean
}): string[] | RecallDocument.category[] => {
  const listOfRequiredAndDesired = [...requiredDocsList(), ...missingNotRequiredDocsList()]
  return listOfRequiredAndDesired
    .map(requiredDocCategory => {
      const uploadedFile = docs.find(doc => doc.category === requiredDocCategory.name)
      if (uploadedFile) {
        return undefined
      }
      return returnLabels ? formatDocLabel(requiredDocCategory.name) : requiredDocCategory.name
    })
    .filter(Boolean)
}

export const listFailedUploads = (
  fileData: UploadedFileMetadata[],
  responses: PromiseSettledResult<NewDocumentResponse>[]
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
        const { category, fileContent, originalFileName, details } = file
        return uploadRecallDocument(recallId, { category, fileContent, fileName: originalFileName, details }, token)
      })
    )
    return listFailedUploads(uploadsToSave, responses)
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
