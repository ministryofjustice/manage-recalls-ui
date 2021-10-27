import { ApiRecallDocument } from './manage-recalls-api'

export interface DocumentCategoryMetadata {
  label: string
  labelLowerCase?: string
  name: ApiRecallDocument.category
  type: 'document' | 'email'
  error?: string
  fileName?: string
  required?: boolean
  hintIfMissing?: boolean
  multiple?: boolean
}

export interface DecoratedDocument extends DocumentCategoryMetadata {
  url: string
  documentId: string
}

export interface UploadedFileMetadata {
  originalFileName: string
  fileName?: string
  mimeType: string
  label: string
  labelLowerCase?: string
  category: ApiRecallDocument.category
  fileContent: string
}

export interface CategorisedFileMetadata {
  documentId: string
  category: ApiRecallDocument.category
  fileName: string
}
