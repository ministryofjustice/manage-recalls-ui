import { ApiRecallDocument, RecallResponse, UpdateRecallRequest } from './manage-recalls-api'

export interface FormError {
  text: string
  href?: string
  values?: ObjectMap<unknown> | string
  errorMsgForField?: string
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

export interface KeyedFormErrors extends ObjectMap<FormError> {
  list: NamedFormError[]
}

export interface UploadDocumentMetadata {
  label: string
  name: ApiRecallDocument.category
  type: 'document' | 'email'
  error?: string
  fileName?: string
  required?: boolean
}

export interface UploadedFormFields {
  [fieldname: string]: Express.Multer.File[]
}

export interface FileDataBase64 {
  originalFileName: string
  label: string
  category: ApiRecallDocument.category
  fileContent: string
}

export interface PersonSearchResult {
  firstName: string
  lastName: string
  nomsNumber?: string
  dateOfBirth?: string
  recalls?: RecallResponse[]
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
  | 'assessStop'
  | 'assessPrison'
  | 'assessRecall'
  | 'assessLicence'
  | 'assessDownload'
  | 'assessEmail'
  | 'recallPreConsName'
  | 'recallSentenceDetails'
  | 'recallRequestReceived'
  | 'recallPrisonPolice'
  | 'recallIssuesNeeds'
  | 'recallProbationOfficer'
  | 'recallDocuments'
  | 'recallCheckAnswers'
  | 'recallConfirmation'
  | 'dossierLetter'
  | 'dossierCheck'
  | 'dossierEmail'
  | 'dossierDownload'
  | 'dossierConfirmation'

export type ReqValidatorFn = (requestBody: ObjectMap<string>, user?: UserDetails) => ReqValidatorReturn
export type ReqEmailUploadValidatorFn = (EmailUploadValidatorArgs) => ReqValidatorReturn

export interface ReqValidatorReturn {
  errors?: NamedFormError[]
  valuesToSave?: UpdateRecallRequest
  unsavedValues?: ObjectMap<unknown>
  redirectToPage?: string
}

export interface EmailUploadValidatorArgs {
  requestBody: ObjectMap<string>
  fileName: string
  emailFileSelected: boolean
  uploadFailed: boolean
  actionedByUserId?: string
}

export interface RecallResult {
  recallId: string
  status: string
  offender: PersonSearchResult
}

export type DateValidationErrorType =
  | 'dateMustBeInPast'
  | 'dateMustBeInFuture'
  | 'blankDateTime'
  | 'invalidDate'
  | 'invalidTime'
  | 'missingDateParts'
export type DatePartNames = 'year' | 'month' | 'day' | 'hour' | 'minute'

export interface DateTimePart {
  name: DatePartNames
  value: string
}

export interface DateValidationError {
  error: DateValidationErrorType
  invalidParts?: DatePartNames[]
}
