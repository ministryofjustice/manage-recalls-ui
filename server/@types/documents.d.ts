import { RecallDocument } from './manage-recalls-api'

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
  uploaded?: DecoratedDocument[]
}

export interface DecoratedDocument extends RecallDocument {
  label: string
  labelLowerCase?: string
  suggestedCategory?: RecallDocument.category
  standardFileName?: string
  type: DocumentType
  url: string
  index?: number
}

export interface DecoratedGeneratedDoc extends RecallDocument {
  type: DocumentType
  url: string
}

export interface UploadedFileMetadata {
  originalFileName: string
  standardFileName?: string
  mimeType: string
  label: string
  labelLowerCase?: string
  category: RecallDocument.category
  fileContent: string
  details?: string
}

export interface CategorisedFileMetadata {
  documentId: string
  category: RecallDocument.category
  fileName: string
  isExistingUpload: boolean
}

// inherits some from MissingDocumentsRecord
export interface DecoratedMissingDocumentsRecord {
  categories: string[]
  createdByUserName: string
  createdDateTime: string
  details: string
  emailId: string
  version: number
  fileName?: string
  url?: string
}

export interface DocumentDecorations {
  documentsUploaded: DecoratedDocument[]
  docCategoriesWithUploads: DocumentCategoryMetadata[]
  requiredDocsMissing: DocumentCategoryMetadata[]
  missingNotRequiredDocs: DocumentCategoryMetadata[]
  missingDocumentsRecords: DecoratedMissingDocumentsRecord[]
  versionedUpload?: DecoratedDocument
  versionedGeneratedDoc?: DecoratedDocument
  emailsUploaded: {
    RECALL_NOTIFICATION_EMAIL?: DecoratedDocument
    RECALL_REQUEST_EMAIL?: DecoratedDocument
    DOSSIER_EMAIL?: DecoratedDocument
  }
  documentsGenerated: {
    RECALL_NOTIFICATION?: DecoratedGeneratedDoc
    REVOCATION_ORDER?: DecoratedGeneratedDoc
    LETTER_TO_PRISON?: DecoratedGeneratedDoc
    DOSSIER?: DecoratedGeneratedDoc
    REASONS_FOR_RECALL?: DecoratedGeneratedDoc
  }
}

export interface AllowedUploadFileType {
  extension: string
  label: string
  mimeType?: string
}
