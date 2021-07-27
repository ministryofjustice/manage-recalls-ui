export interface RecallDocumentUploadError {
  category: string
  fileName: string
  text: string
}

export interface PrisonerSearchResult {
  firstName: string
  lastName: string
  nomsNumber?: string
  dateOfBirth?: string
}
