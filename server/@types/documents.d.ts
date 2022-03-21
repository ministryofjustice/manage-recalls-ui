import { RecallDocument, RescindRecord, Note } from './manage-recalls-api'
import { PartBRecord } from './manage-recalls-api/models/PartBRecord'

export type DocumentType = 'document' | 'email' | 'generated' | 'note_document'

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
  uploaded?: DecoratedUploadedDoc[]
}

export interface DecoratedUploadedDoc extends RecallDocument {
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

export interface DecoratedRescindRecord extends RescindRecord {
  requestEmailUrl: string
  decisionEmailUrl: string
}

export interface DecoratedNote extends Note {
  documentUrl: string
}

export interface DecoratedPartBRecord extends PartBRecord {
  partBUrl: string
  oasysUrl: string
  emailUrl: string
}

export interface DocumentDecorations {
  documentsUploaded: DecoratedUploadedDoc[]
  docCategoriesWithUploads: DocumentCategoryMetadata[]
  requiredDocsMissing: DocumentCategoryMetadata[]
  missingNotRequiredDocs: DocumentCategoryMetadata[]
  versionedUpload?: DecoratedUploadedDoc
  versionedGeneratedDoc?: DecoratedUploadedDoc
  emailsUploaded: {
    RECALL_NOTIFICATION_EMAIL?: DecoratedUploadedDoc
    RECALL_REQUEST_EMAIL?: DecoratedUploadedDoc
    DOSSIER_EMAIL?: DecoratedUploadedDoc
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
