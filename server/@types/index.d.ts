import { ApiRecallDocument, RecallResponse } from './manage-recalls-api'

export interface FormError {
  text: string
  href: string
  values?: ObjectMap<unknown> | string
}

export interface ObjectMixed {
  [key: string]: string | boolean
}

export interface ObjectMap<T> {
  [key: string]: T
}

export interface NamedFormError extends FormError {
  name: string
}

export interface UploadError {
  name: ApiRecallDocument.category
  fileName: string
  text: string
  href: string
}

export interface UploadDocumentMetadata {
  label: string
  name: ApiRecallDocument.category
  type: 'document' | 'email'
  error?: string
}

export interface UploadedFormFields {
  [fieldname: string]: Express.Multer.File[]
}

export interface FileDataBase64 {
  fileName: string
  label: string
  category: ApiRecallDocument.category
  fileContent: string
}

export interface PersonSearchResult {
  firstName: string
  lastName: string
  nomsNumber?: string
  dateOfBirth?: string
}

export interface DatePartsParsed {
  year: number
  month: number
  day: number
  hour?: number
  minute?: number
}

export interface RecallFormValues {
  recallEmailReceivedDateTimeParts?: DatePartsParsed
  lastReleaseDateParts?: DatePartsParsed
  sentenceDateParts?: DatePartsParsed
  sentenceExpiryDateParts?: DatePartsParsed
  licenceExpiryDateParts?: DatePartsParsed
  conditionalReleaseDateParts?: DatePartsParsed
  lastReleasePrison?: string
  contraband?: boolean
  contrabandDetail?: string
  vulnerabilityDiversity?: boolean
  vulnerabilityDiversityDetail?: string
  mappaLevel?: string
  sentencingCourt?: string
  indexOffence?: string
  localPoliceForce?: string
  agreeWithRecall?: RecallResponse.agreeWithRecall
  agreeWithRecallDetailYes?: string
  agreeWithRecallDetailNo?: string
}

export interface RecallResponseWithDocuments extends RecallResponse {
  recallNotificationEmail: DecoratedDocument
  documents: DecoratedDocument[]
}

export interface DecoratedRecallResponse extends RecallResponseWithDocuments {
  recallLengthFormatted: string
  mappaLevelFormatted: string
  probationDivisionFormatted: string
}

export interface DecoratedDocument extends UploadDocumentMetadata {
  fileName?: string
  url: string
}

export interface Prison {
  prisonId: string
  prisonName: string
  active: boolean
}

export interface UiListItem {
  value: string
  text: string
  selected?: boolean
}

export type ViewName =
  | 'assessConfirmation'
  | 'assessDecision'
  | 'assessPrison'
  | 'assessRecall'
  | 'assessLicence'
  | 'assessEmail'
  | 'recallSentenceDetails'
  | 'recallRequestReceived'
  | 'recallPrisonPolice'
  | 'recallIssuesNeeds'
  | 'recallProbationOfficer'
  | 'recallConfirmation'
  | 'dossierLetter'
  | 'dossierConfirmation'
