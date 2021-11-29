import { NamedFormError, ObjectMap, UrlInfo } from '../../../../@types'
import { documentCategories } from './documentCategories'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { AddDocumentResponse } from '../../../../@types/manage-recalls-api/models/AddDocumentResponse'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'
import { makeErrorObject } from '../index'
import { CategorisedFileMetadata, DocumentCategoryMetadata, UploadedFileMetadata } from '../../../../@types/documents'
import { addRecallDocument, setDocumentCategory } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { autocategoriseDocFileName } from './autocategorise'

export const makeMetaDataForFile = (
  file: Express.Multer.File,
  forceCategory?: RecallDocument.category
): UploadedFileMetadata => {
  const documentCategory = forceCategory ? findDocCategory(forceCategory) : autocategoriseDocFileName(file.originalname)
  return {
    originalFileName: file.originalname,
    fileName: documentCategory.fileName,
    mimeType: file.mimetype,
    label: documentCategory.label,
    labelLowerCase: documentCategory.labelLowerCase,
    category: documentCategory.name,
    fileContent: file.buffer.toString('base64'),
  }
}

export const getMetadataForUploadedFiles = (
  files: Express.Multer.File[],
  forceCategory?: RecallDocument.category
): UploadedFileMetadata[] => {
  return files ? files.map(file => makeMetaDataForFile(file, forceCategory)) : []
}

export const getMetadataForCategorisedFiles = (requestBody: ObjectMap<string>): CategorisedFileMetadata[] => {
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

export const generatedDocCategoriesList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'generated')

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
            text: `${fileData[idx].originalFileName} contains a virus`,
          })
        }
        return makeErrorObject({
          id: 'documents',
          text: `${fileData[idx].originalFileName} could not be uploaded - try again`,
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

export const getGeneratedDocFileName = ({
  firstName,
  lastName,
  bookingNumber,
  docCategory,
}: {
  firstName: string
  lastName: string
  bookingNumber: string
  docCategory: RecallDocument.category
}) => {
  const details = `${formatPersonName({ firstName, lastName })}${formatBookingNumber(bookingNumber)}`
  switch (docCategory) {
    case RecallDocument.category.RECALL_NOTIFICATION:
      return `IN CUSTODY RECALL ${details}.pdf`
    case RecallDocument.category.DOSSIER:
      return `${details} RECALL DOSSIER.pdf`
    case RecallDocument.category.LETTER_TO_PRISON:
      return `${details} LETTER TO PRISON.pdf`
    case RecallDocument.category.REVOCATION_ORDER:
      return `${details} REVOCATION ORDER.pdf`
    case RecallDocument.category.REASONS_FOR_RECALL:
      return `${details} REASONS FOR RECALL.pdf`
    default:
      return 'document.pdf'
  }
}

export const getGeneratedDocUrlPath = ({
  recallId,
  nomsNumber,
  documentId,
  docCategory,
}: {
  recallId: string
  nomsNumber: string
  documentId?: string
  docCategory: RecallDocument.category
}): string | undefined => {
  const basePath = `/persons/${nomsNumber}/recalls/${recallId}/documents/`
  switch (docCategory) {
    case RecallDocument.category.RECALL_NOTIFICATION:
      return `${basePath}recall-notification`
    case RecallDocument.category.DOSSIER:
      return `${basePath}dossier`
    case RecallDocument.category.LETTER_TO_PRISON:
      return `${basePath}letter-to-prison`
    case RecallDocument.category.REVOCATION_ORDER:
      return `${basePath}revocation-order/${documentId}`
    case RecallDocument.category.REASONS_FOR_RECALL:
      return `${basePath}reasons-for-recall/${documentId}`
    default:
      return undefined
  }
}

export const formatPersonName = ({ firstName = '', lastName = '' }: { firstName?: string; lastName?: string }) =>
  `${lastName?.toUpperCase()} ${firstName?.toUpperCase()}`

export const formatBookingNumber = (bookingNumber: string) => (bookingNumber ? ` ${bookingNumber.toUpperCase()}` : '')
