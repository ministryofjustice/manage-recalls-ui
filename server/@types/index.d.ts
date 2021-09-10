import { ApiRecallDocument, RecallResponse, UpdateRecallRequest } from './manage-recalls-api'

export interface FormError {
  text: string
  href?: string
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
  dossierEmail?: DecoratedDocument
  recallNotificationEmail?: DecoratedDocument
  documents: DecoratedDocument[]
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
  | 'assessDownload'
  | 'assessEmail'
  | 'recallSentenceDetails'
  | 'recallRequestReceived'
  | 'recallPrisonPolice'
  | 'recallIssuesNeeds'
  | 'recallProbationOfficer'
  | 'recallConfirmation'
  | 'dossierLetter'
  | 'dossierCheck'
  | 'dossierDownload'
  | 'dossierConfirmation'

export type ReqValidatorFn = (requestBody: ObjectMap<string>) => ReqValidatorReturn

export interface ReqValidatorReturn {
  errors?: NamedFormError[]
  valuesToSave?: UpdateRecallRequest
  unsavedValues?: ObjectMap<unknown>
}

export interface RecallResult {
  recallId: string
  status: string
  offender: PersonSearchResult
}
