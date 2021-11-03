import { NamedFormError, ObjectMap, UrlInfo } from '../../../@types'
import { documentCategories } from '../book/documentCategories'
import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { AddDocumentResponse } from '../../../@types/manage-recalls-api/models/AddDocumentResponse'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { makeErrorObject } from './index'
import {
  CategorisedFileMetadata,
  DecoratedDocument,
  DocumentCategoryMetadata,
  UploadedFileMetadata,
} from '../../../@types/documents'
import { addRecallDocument, setDocumentCategory } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

export const makeMetaDataForFile = (category: string, file: Express.Multer.File): UploadedFileMetadata => {
  const documentCategory = documentCategories.find(doc => doc.name === category)
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

export const getMetadataForUploadedFiles = (files: Express.Multer.File[]): UploadedFileMetadata[] => {
  return files ? files.map(file => makeMetaDataForFile(ApiRecallDocument.category.UNCATEGORISED, file)) : []
}

export const getMetadataForCategorisedFiles = (requestBody: ObjectMap<string>): CategorisedFileMetadata[] => {
  const categoryKeys = Object.keys(requestBody).filter(key => key.startsWith('category-'))
  return categoryKeys.map(key => {
    const documentId = key.replace('category-', '')
    return {
      documentId,
      category: requestBody[key] as ApiRecallDocument.category,
      fileName: requestBody[`fileName-${documentId}`], // TODO - log if not found?
    }
  })
}

export const requiredDocsList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document' && doc.required)

export const missingNotRequiredDocsList = (): DocumentCategoryMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document' && doc.hintIfMissing)

export const decorateDocs = ({
  docs,
  nomsNumber,
  recallId,
}: {
  docs: ApiRecallDocument[]
  nomsNumber: string
  recallId: string
}): {
  documents: DecoratedDocument[]
  documentCategories: DocumentCategoryMetadata[]
  requiredDocsMissing: DocumentCategoryMetadata[]
  missingNotRequiredDocs: DocumentCategoryMetadata[]
  recallNotificationEmail?: DecoratedDocument
  recallRequestEmail?: DecoratedDocument
  dossierEmail?: DecoratedDocument
} => {
  const decoratedUploadedDocs = [] as DecoratedDocument[]
  documentCategories.forEach(documentCategory => {
    docs
      .filter(d => documentCategory.name === d.category)
      .forEach(d => {
        decoratedUploadedDocs.push({
          ...d,
          ...documentCategory,
          url: `/persons/${nomsNumber}/recalls/${recallId}/documents/${d.documentId}`,
        })
      })
  })
  const decoratedDocTypes = documentCategories
    .filter(doc => doc.type === 'document')
    .map(docType => {
      const uploadedDocs = decoratedUploadedDocs.filter(d => d.name === docType.name)
      return {
        ...docType,
        uploaded: uploadedDocs.map(d => ({ url: d.url, fileName: d.fileName, documentId: d.documentId })),
      }
    })
  return decoratedUploadedDocs.reduce(
    (acc, curr) => {
      if (curr.type === 'document') {
        acc.documents.push(curr)
      }
      if (curr.name === ApiRecallDocument.category.RECALL_NOTIFICATION_EMAIL) {
        acc.recallNotificationEmail = curr
      }
      if (curr.name === ApiRecallDocument.category.RECALL_REQUEST_EMAIL) {
        acc.recallRequestEmail = curr
      }
      if (curr.name === ApiRecallDocument.category.DOSSIER_EMAIL) {
        acc.dossierEmail = curr
      }
      return acc
    },
    {
      documents: [],
      documentCategories: decoratedDocTypes,
      requiredDocsMissing: requiredDocsList().filter(
        requiredDocCategory => !decoratedUploadedDocs.find(doc => doc.name === requiredDocCategory.name)
      ),
      missingNotRequiredDocs: missingNotRequiredDocsList().filter(
        requiredDocCategory => !decoratedUploadedDocs.find(doc => doc.name === requiredDocCategory.name)
      ),
      recallNotificationEmail: undefined,
      recallRequestEmail: undefined,
      dossierEmail: undefined,
    }
  )
}

export const listMissingRequiredDocs = (fileCategories: ApiRecallDocument.category[]): string[] => {
  return requiredDocsList()
    .map(requiredDocCategory => {
      const uploadedFile = fileCategories.find(fileCategory => fileCategory === requiredDocCategory.name)
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

export const formatDocLabel = (category: ApiRecallDocument.category) => {
  const docCategory = documentCategories.find(d => d.name === category)
  return docCategory ? docCategory.labelLowerCase || docCategory.label.toLowerCase() : ''
}

export const enableDeleteDocuments = (recallStatus: RecallResponse.status, urlInfo: UrlInfo) => {
  if (recallStatus !== RecallResponse.status.BEING_BOOKED_ON) {
    return false
  }
  return !(urlInfo.fromPage && urlInfo.fromPage !== 'check-answers')
}
