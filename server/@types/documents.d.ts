import { RecallDocument } from './manage-recalls-api'
import { MissingDocumentsRecord } from './manage-recalls-api/models/MissingDocumentsRecord'

export interface DocumentCategoryMetadata {
  label: string
  labelLowerCase?: string
  name: RecallDocument.category
  type: 'document' | 'email' | 'generated'
  error?: string
  fileName?: string
  required?: boolean
  hintIfMissing?: boolean
  multiple?: boolean
  versioned?: boolean
  fileNamePatterns?: string[]
}

export interface DecoratedDocument extends DocumentCategoryMetadata, RecallDocument {
  url: string
  index?: number
}

export interface UploadedFileMetadata {
  originalFileName: string
  fileName?: string
  mimeType: string
  label: string
  labelLowerCase?: string
  category: RecallDocument.category
  fileContent: string
}

export interface CategorisedFileMetadata {
  documentId: string
  category: RecallDocument.category
  fileName: string
}

export interface DecoratedMissingDocumentRecord extends MissingDocumentsRecord {
  url: string
}
