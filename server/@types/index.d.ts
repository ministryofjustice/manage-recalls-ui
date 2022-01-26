import { RecallDocument, RecallResponse, SearchResult, UpdateRecallRequest } from './manage-recalls-api'
import { DecoratedMissingDocumentsRecord, DocumentDecorations } from './documents'
import { ReferenceDataCategories } from '../referenceData'

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

export interface Prison {
  prisonId: string
  prisonName: string
  active: boolean
}

export interface PoliceForce {
  id: string
  name: string
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
  | 'recallCustodyStatus'
  | 'recallFindAddress'
  | 'recallFindAddressResults'
  | 'recallAddressManual'
  | 'recallAddressList'
  | 'recallLastKnownAddress'
  | 'recallLicenceName'
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
  | 'changeHistory'
  | 'changeHistoryForDocument'
  | 'changeHistoryForField'
  | 'newGeneratedDocumentVersion'

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

export type ValidationErrorType =
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
  | 'noSelectionFromList'
  | 'invalidSelectionFromList'

export type DatePartNames = 'year' | 'month' | 'day' | 'hour' | 'minute'

export interface DateTimePart {
  name: DatePartNames
  value: string
}

export interface ValidationError {
  errorId: ValidationErrorType
  invalidParts?: DatePartNames[]
}

export interface UrlInfo {
  fromPage?: string
  fromHash?: string
  currentPage: string
  basePath: string
}

export interface ConfirmationMessage {
  text: string
  type: 'success'
}

export interface DecoratedRecall extends RecallResponse, DocumentDecorations {
  missingDocumentsRecords: DecoratedMissingDocumentsRecord[] // this is in both ancestor types, so override to get the correct one
  enableDeleteDocuments: boolean
}

export interface PersonAndRecallResponse {
  person: SearchResult
  recall: RecallResponse
}

export interface RecallField {
  label?: string
  fieldType:
    | 'TEXT'
    | 'ENUM'
    | 'REF_DATA'
    | 'REF_DATA_LIST'
    | 'ISO_DATE_TIME'
    | 'ISO_DATE'
    | 'BOOLEAN'
    | 'SENTENCE_LENGTH'
    | 'UPLOADED_EMAIL'
  refDataCategory?: ReferenceDataCategories
  documentCategory?: RecallDocument.category
  fieldName?: string
  enumValues?: ObjectMap<string>
  hasHistory?: boolean
}

export interface Address {
  line1: string
  line2?: string
  town: string
  postcode?: string
}
