import { RecallDocument } from './manage-recalls-api'
import { MissingDocumentsRecord } from './manage-recalls-api/models/MissingDocumentsRecord'

type DocumentType = 'document' | 'email' | 'generated'

export interface DocumentCategoryMetadata {
  label: string
  labelLowerCase?: string
  name: RecallDocument.category
  type: DocumentType
  error?: string
  standardFileName?: string
  required?: boolean
  hintIfMissing?: boolean
  multiple?: boolean
  versioned?: boolean
  fileNamePatterns?: string[]
}

export interface DecoratedDocument extends RecallDocument {
  label: string
  labelLowerCase?: string
  category: RecallDocument.category
  suggestedCategory?: RecallDocument.category
  standardFileName?: string
  type: DocumentType
  url: string
  index?: number
}

export interface UploadedFileMetadata {
  originalFileName: string
  standardFileName?: string
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
  isExistingUpload: boolean
}

export interface DecoratedMissingDocumentRecord extends MissingDocumentsRecord {
  url: string
}
