import { ApiRecallDocument } from './manage-recalls-api'

export interface FormError {
  text: string
  href: string
}

export interface ObjectMixed {
  [key: string]: string | boolean
}

export interface ObjectMap<T> {
  [key: string]: T
}

export interface NamedFormError extends FormError {
  name: string
  values?: ObjectMap<string>
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

export interface PrisonerSearchResult {
  firstName: string
  lastName: string
  nomsNumber?: string
  dateOfBirth?: string
}
