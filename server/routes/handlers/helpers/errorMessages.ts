import { ValidationError } from '../../../@types'
import { allowedEmailFileExtensions } from '../documents/upload/helpers/allowedUploadExtensions'
import { listToString } from './index'

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
    case 'minValueDateTimeParts':
      return `The date and time you ${userAction} must be in the correct format, like 06 05 2021 09:03`
    case 'minLengthDateParts':
    case 'minValueDateParts':
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
    case 'missingDateParts':
      return `The ${fieldLabel} must include a ${listToString(validationError.invalidParts, 'and')}`
    case 'minLengthDateTimeParts':
    case 'minValueDateTimeParts':
      return `The ${fieldLabel} must be in the correct format, like 06 05 2021 09:03`
    case 'minLengthDateParts':
    case 'minValueDateParts':
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

export const errorMsgDocumentUpload = {
  noFile: 'Select a file',
  saveError: 'An error occurred saving your changes',
  containsVirus: (fileName: string) => `${fileName} contains a virus`,
  uploadFailed: (fileName: string) => `${fileName} could not be uploaded - try again`,
}
