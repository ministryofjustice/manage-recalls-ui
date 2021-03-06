import { RecallDocument, RecallResponse, RecallResponseLite } from './manage-recalls-api'
import { DecoratedMissingDocumentsRecord, DocumentDecorations } from './documents'
import { ReferenceDataCategories } from '../referenceData'
import { UserDetails } from '../clients/userService'

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
  | 'assessCustodyStatus'
  | 'assessDownload'
  | 'assessEmail'
  | 'recallCustodyStatus'
  | 'recommendedRecallType'
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
  | 'dossierPrison'
  | 'dossierNsyEmail'
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
  | 'warrantReference'
  | 'rtcDates'
  | 'addNote'
  | 'rescindRequest'
  | 'rescindDecision'
  | 'stopRecall'
  | 'partB'
  | 'supportRerelease'
  | 'secondaryDossierRecallInfo'
  | 'secondaryDossierLegalRep'
  | 'secondaryDossierProbation'

export type ReqValidatorFn = ({ requestBody, user, urlInfo }: ReqValidatorArgs) => ReqValidatorReturn

export interface ReqValidatorArgs {
  requestBody?: ObjectMap<string>
  user?: UserDetails
  urlInfo?: UrlInfo
}

export type FormWithDocumentUploadValidatorFn = (FormWithDocumentUploadValidatorArgs) => ReqValidatorReturn

export interface ReqValidatorReturn<T> {
  errors?: NamedFormError[]
  valuesToSave?: T
  unsavedValues?: ObjectMap<unknown>
  redirectToPage: string
  confirmationMessage?: ConfirmationMessage | ConfirmationMessageGroup
}

export interface User extends UserDetails {
  token: string
}

export interface FormWithDocumentUploadValidatorArgs {
  requestBody: ObjectMap<string>
  file?: Express.Multer.File
  wasUploadFileReceived: boolean
  uploadFailed: boolean
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
  | 'minValueDateYear'
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

export interface ConfirmationMessageBase {
  text: string
  link?: {
    text: string
    href: string
  }
}

export interface ConfirmationMessage extends ConfirmationMessageBase {
  type: string
  pageToDisplayOn?: string
  pagesInBetween?: string[]
}

export interface ConfirmationMessageGroup {
  heading: string
  bannerType: string
  pageToDisplayOn?: string
  pagesInBetween?: string[]
  items: ConfirmationMessageBase[]
}

export interface DecoratedRecall extends RecallResponse, DocumentDecorations {
  fullName?: string
  missingDocumentsRecords: DecoratedMissingDocumentsRecord[] // this is in both ancestor types, so override to get the correct one
  enableDeleteDocuments: boolean
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

export interface SaveToApiFnArgs {
  recallId?: string
  valuesToSave: ObjectMap<unknown>
  user: User
}

export type SaveToApiFn = ({ recallId, valuesToSave, user }: SaveToApiFnArgs) => Promise<unknown>

export interface RecallResponseLiteDecorated extends RecallResponseLite {
  toDoDueDateTime?: string
  completedDateTime?: string
}
