import { NamedFormError, UrlInfo } from '../../../../@types'
import { documentCategories } from '../../documentCategories'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { NewDocumentResponse } from '../../../../@types/manage-recalls-api/models/NewDocumentResponse'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'
import { DocumentCategoryMetadata, UploadedFileMetadata } from '../../../../@types/documents'
import { uploadRecallDocument } from '../../../../clients/manageRecallsApiClient'
import { errorMsgDocumentUpload, makeErrorObject } from '../../../utils/errorMessages'
import { roundToDecimalPlaces } from '../../../utils/numbers'

export const makeMetaDataForFile = (
  file: Express.Multer.File,
  categoryName: RecallDocument.category,
  details?: string
): UploadedFileMetadata | undefined => {
  const documentCategory = findDocCategory(categoryName)
  if (!documentCategory) {
    throw new Error(`makeMetaDataForFile: invalid category name: ${categoryName}`)
  }
  if (!file) {
    return undefined
  }
  return {
    originalFileName: file.originalname,
    standardFileName: documentCategory.standardFileName,
    mimeType: file.mimetype,
    label: documentCategory.label,
    labelLowerCase: documentCategory.labelLowerCase,
    category: documentCategory.name,
    fileContent: file.buffer.toString('base64'),
    details,
    sizeMB: bytesToMB(file.size),
  }
}

export const MAX_UPLOAD_FILE_SIZE_MB = 25

export const getMetadataForUploadedFiles = (
  files: Express.Multer.File[],
  categoryName: RecallDocument.category,
  details?: string
): UploadedFileMetadata[] => {
  return files ? files.map(file => makeMetaDataForFile(file, categoryName, details)) : []
}

export const uploadedDocCategoriesList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document')

export const requiredDocsList = (recall: RecallResponse): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => {
    if (doc.type === 'document' && doc.required) {
      if (doc.name === RecallDocument.category.PART_B_RISK_REPORT) {
        return Boolean(
          recall.status === RecallResponse.status.AWAITING_PART_B && recall.partBDueDate && !recall.partBRecords?.length
        )
      }
      return true
    }
    return false
  })

export const missingNotRequiredDocsList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document' && doc.hintIfMissing)

export const listMissingRequiredDocs = ({
  recall,
  returnLabels,
}: {
  recall: RecallResponse
  returnLabels: boolean
}): string[] | RecallDocument.category[] => {
  const docs = recall.documents
  const listOfRequiredAndDesired = [...requiredDocsList(recall), ...missingNotRequiredDocsList()]
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

export const bytesToMB = (bytes: number) => roundToDecimalPlaces(bytes / 1000000, 1)
