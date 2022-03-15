import { FormError, KeyedFormErrors, NamedFormError, ObjectMap, ValidationError } from '../../@types'
import {
  allowedDocumentFileExtensions,
  allowedEmailFileExtensions,
  allowedNoteFileExtensions,
} from '../documents/upload/helpers/allowedUploadExtensions'
import { listToString } from './lists'
import { renderTemplateString } from '../../nunjucks/nunjucksFunctions'
import { SanitisedError } from '../../utils/sanitisedError'
import { MIN_VALUE_YEAR } from './dates/convert'

export const errorMsgUserActionDateTime = (
  validationError: ValidationError,
  userAction: string,
  dateOnly?: boolean
): string => {
  const noun = dateOnly ? 'date' : 'date and time'
  switch (validationError.errorId) {
    case 'blankDateTime':
      return `Enter the ${noun} you ${userAction}`
    case 'dateMustBeInPast':
      return `The ${dateOnly ? 'date' : 'time'} you ${userAction} must be today or in the past`
    case 'missingDate':
      return `Enter the date you ${userAction}`
    case 'missingTime':
      return `Enter the time you ${userAction}`
    case 'invalidDate':
      return `The date you ${userAction} must be a real date`
    case 'invalidTime':
      return `The time you ${userAction} must be a real time`
    case 'missingDateParts':
      return `The ${noun} you ${userAction} must include a ${listToString(validationError.invalidParts, 'and')}`
    case 'minLengthDateTimeParts':
      return `The ${noun} you ${userAction} must be in the correct format, like 06 05 2021 09:03`
    case 'minValueDateYear':
      return `The year you ${userAction} must be later than ${MIN_VALUE_YEAR}`
    case 'minLengthDateParts':
      return `The date you ${userAction} must be in the correct format, like 06 05 2021`
    default:
      return `Error with the ${noun} ${userAction}`
  }
}

export const formatValidationErrorMessage = (validationError: ValidationError, fieldLabel: string): string => {
  switch (validationError.errorId) {
    // dates
    case 'blankDateTime':
      return `Enter the ${fieldLabel}`
    case 'dateMustBeInPast':
      return `The ${fieldLabel} must be today or in the past`
    case 'dateMustBeInFuture':
      return `The ${fieldLabel} must be in the future`
    case 'invalidDate':
      return `The ${fieldLabel} must be a real date`
    case 'invalidTime':
      return `The ${fieldLabel} must be a real time`
    case 'missingDate':
      return `The ${fieldLabel} must include a date`
    case 'missingTime':
      return `The ${fieldLabel} must include a time`
    case 'missingDateParts':
      return `The ${fieldLabel} must include a ${listToString(validationError.invalidParts, 'and')}`
    case 'minValueDateYear':
      return `The year must be later than ${MIN_VALUE_YEAR}`
    case 'minLengthDateTimeParts':
      return `The ${fieldLabel} must be in the correct format, like 06 05 2021 09:03`
    case 'minLengthDateParts':
      return `The ${fieldLabel} must be in the correct format, like 06 05 2021`
    // autocompletes and dropdowns
    case 'noSelectionFromList':
      return `Select ${fieldLabel}`
    // invalid input was typed into an autocomplete
    case 'invalidSelectionFromList':
      return `Select ${fieldLabel} from the list`
    default:
      return `Error - ${fieldLabel}`
  }
}

export const errorMsgEmailUpload = {
  noFile: 'Select an email',
  uploadFailed: 'The selected file could not be uploaded – try again',
  invalidFileFormat: `The selected file must be an ${allowedEmailFileExtensions.map(ext => ext.label).join(' or ')}`,
  confirmSent: "Confirm you've sent the email to all recipients",
  containsVirus: (fileName: string) => `${fileName} contains a virus`,
}

export const errorMsgProvideDetail = 'Provide more detail'

export const errorMsgInvalidPhoneNumber = 'Enter a phone number in the correct format, like 01277 960901'
export const errorMsgInvalidEmail = 'Enter an email address in the correct format, like name@example.com'

export const errorMsgDocumentUpload = {
  noFile: 'Select a file',
  saveError: 'An error occurred saving your changes',
  containsVirus: (fileName: string) => `${fileName} contains a virus`,
  uploadFailed: (fileName: string) => `${fileName} could not be uploaded - try again`,
  invalidFileFormat: (fileName: string) =>
    `The selected file '${fileName}' must be a ${listToString(
      allowedDocumentFileExtensions.map(ext => ext.label),
      'or'
    )}`,
}

export const errorMsgNoteFileUpload = {
  invalidFileFormat: (fileName: string) =>
    `The selected file '${fileName}' must be an ${listToString(
      allowedNoteFileExtensions.map(ext => ext.label),
      'or'
    )}`,
}

export const saveErrorObject = {
  name: 'saveError',
  text: 'An error occurred saving your changes',
}

export const saveErrorWithDetails = ({ err, isProduction }: { err: SanitisedError; isProduction: boolean }) => {
  if (isProduction) {
    return saveErrorObject
  }
  return {
    name: 'saveError',
    text: err.text || err.stack,
  }
}

export const makeErrorObject = ({
  id,
  text,
  values,
}: {
  id: string
  text: string
  values?: ObjectMap<string> | string
}): NamedFormError => ({
  name: id,
  text,
  href: `#${id}`,
  values,
})

export const transformErrorMessages = (errors: NamedFormError[]): KeyedFormErrors => {
  const errorMap = errors.filter(Boolean).reduce((acc: ObjectMap<FormError>, curr: NamedFormError) => {
    const { name, ...rest } = curr
    acc[name] = rest
    return acc
  }, {})
  return {
    list: errors,
    ...errorMap,
  } as KeyedFormErrors
}

export const renderErrorMessages = (
  errors: KeyedFormErrors,
  locals: ObjectMap<unknown>
): KeyedFormErrors | undefined => {
  if (!errors) {
    return undefined
  }
  return Object.entries(errors).reduce(
    (acc, [key, val]) => {
      if (key === 'list') {
        acc.list = (val as unknown as NamedFormError[]).map(err => ({
          ...err,
          text: renderTemplateString(err.text, locals),
        }))
      } else {
        acc[key] = { ...val, text: renderTemplateString(val.text, locals) }
      }
      return acc
    },
    { list: [] }
  ) as KeyedFormErrors
}
