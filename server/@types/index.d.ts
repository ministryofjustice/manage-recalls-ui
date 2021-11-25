import { RecallResponse, UpdateRecallRequest } from './manage-recalls-api'
import { DecoratedDocument, DecoratedMissingDocumentRecord, DocumentCategoryMetadata } from './documents'
import { SearchResult } from './manage-recalls-api/models/SearchResult'

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

export interface KeyedFormErrors extends ObjectMap<FormError> {
  list: NamedFormError[]
}

export interface DatePartsParsed {
  year: string
  month: string
  day: string
  hour?: string
  minute?: string
}

// TODO - needs updating with all fields
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
  missingDocumentsDetail?: string
}

export interface Prison {
  prisonId: string
  prisonName: string
  active: boolean
}

export interface UiListItem {
  value: string
  text: string
  active?: boolean
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
  | 'recallMissingDocuments'
  | 'recallUploadDocumentVersion'
  | 'recallCheckAnswers'
  | 'recallConfirmation'
  | 'dossierRecallInformation'
  | 'dossierLetter'
  | 'dossierCheck'
  | 'dossierEmail'
  | 'dossierDownload'
  | 'dossierConfirmation'
  | 'viewFullRecall'

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
  fileName?: string
  emailFileSelected: boolean
  uploadFailed: boolean
  invalidFileFormat: boolean
  actionedByUserId?: string
}

export interface RecallResult {
  recall: RecallResponse
  person: SearchResult
}

export type DateValidationErrorType =
  | 'dateMustBeInPast'
  | 'dateMustBeInFuture'
  | 'blankDateTime'
  | 'invalidDate'
  | 'missingDate'
  | 'invalidTime'
  | 'missingTime'
  | 'missingDateParts'
  | 'minLengthDateParts'
  | 'minValueDateParts'
  | 'minLengthDateTimeParts'
  | 'minValueDateTimeParts'

export type DatePartNames = 'year' | 'month' | 'day' | 'hour' | 'minute'

export interface DateTimePart {
  name: DatePartNames
  value: string
}

export interface DateValidationError {
  error: DateValidationErrorType
  invalidParts?: DatePartNames[]
}

export interface UrlInfo {
  fromPage?: string
  fromHash?: string
  currentPage: string
  basePath: string
}

export interface AllowedUploadFileType {
  extension: string
  label: string
  mimeType?: string
}

export interface ConfirmationMessage {
  text: string
  type: 'success'
}

export interface DecoratedRecall extends RecallResponse, DocumentDecorations {
  enableDeleteDocuments: boolean
}

export interface DocumentDecorations {
  documentsUploaded: DecoratedDocument[]
  documentCategories: DocumentCategoryMetadata[]
  requiredDocsMissing: DocumentCategoryMetadata[]
  missingNotRequiredDocs: DocumentCategoryMetadata[]
  missingDocumentsRecord: DecoratedMissingDocumentRecord
  versionedCategory?: DecoratedDocument
  emailsUploaded: {
    RECALL_NOTIFICATION_EMAIL?: DecoratedDocument
    RECALL_REQUEST_EMAIL?: DecoratedDocument
    DOSSIER_EMAIL?: DecoratedDocument
  }
  documentsGenerated: {
    RECALL_NOTIFICATION?: DecoratedDocument
    REVOCATION_ORDER?: DecoratedDocument
    LETTER_TO_PRISON?: DecoratedDocument
    DOSSIER?: DecoratedDocument
    REASONS_FOR_RECALL?: DecoratedDocument
  }
}
