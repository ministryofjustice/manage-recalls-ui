import { ApiRecallDocument } from './manage-recalls-api'
import { MissingDocumentsRecordResponse } from './manage-recalls-api/models/MissingDocumentsRecordResponse'

export interface DocumentCategoryMetadata {
  label: string
  labelLowerCase?: string
  name: ApiRecallDocument.category
  type: 'document' | 'email' | 'generated'
  error?: string
  fileName?: string
  required?: boolean
  hintIfMissing?: boolean
  multiple?: boolean
  versioned?: boolean
  fileNamePatterns?: string[]
}

export interface DecoratedDocument extends DocumentCategoryMetadata, ApiRecallDocument {
  url: string
  index?: number
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

export interface DecoratedMissingDocumentRecord extends MissingDocumentsRecordResponse {
  url: string
}
