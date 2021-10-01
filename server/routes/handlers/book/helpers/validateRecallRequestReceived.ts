import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { DateValidationError, EmailUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates'
import { allowedEmailFileExtensions } from '../../helpers/uploadStorage'
import { AddDocumentRequest } from '../../../../@types/manage-recalls-api/models/AddDocumentRequest'

const makeErrorMessage = (validationError: DateValidationError): string => {
  switch (validationError.error) {
    case 'blankDateTime':
      return 'Enter the date you received the email'
    case 'dateMustBeInPast':
      return 'The date you received the email must be today or in the past'
    case 'invalidDate':
      return 'The date you received the email must be a real date'
    case 'invalidTime':
      return 'The time you received the email must be a real time'
    case 'missingDateParts':
      return `The date you received the email must include: ${validationError.invalidParts.join(', ')}`
    default:
      return 'Error - recall email received'
  }
}

export const validateRecallRequestReceived = ({
  requestBody,
  fileName,
  emailFileSelected,
  uploadFailed,
}: EmailUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave: UpdateRecallRequest
  unsavedValues: ObjectMap<unknown>
} => {
  let errors
  let unsavedValues
  let valuesToSave
  const recallEmailReceivedDateTimeParts = {
    year: requestBody.recallEmailReceivedDateTimeYear,
    month: requestBody.recallEmailReceivedDateTimeMonth,
    day: requestBody.recallEmailReceivedDateTimeDay,
    hour: requestBody.recallEmailReceivedDateTimeHour,
    minute: requestBody.recallEmailReceivedDateTimeMinute,
  }
  const recallEmailReceivedDateTime = convertGmtDatePartsToUtc(recallEmailReceivedDateTimeParts, {
    dateMustBeInPast: true,
    includeTime: true,
  })
  const invalidFileExtension = emailFileSelected
    ? !allowedEmailFileExtensions.some((ext: string) => fileName.endsWith(ext))
    : false
  const existingUpload = requestBody[AddDocumentRequest.category.RECALL_REQUEST_EMAIL] === 'existingUpload'
  if (
    (!emailFileSelected && !existingUpload) ||
    uploadFailed ||
    invalidFileExtension ||
    dateHasError(recallEmailReceivedDateTime)
  ) {
    errors = []
    if (dateHasError(recallEmailReceivedDateTime)) {
      errors.push(
        makeErrorObject({
          id: 'recallEmailReceivedDateTime',
          text: makeErrorMessage(recallEmailReceivedDateTime as DateValidationError),
          values: recallEmailReceivedDateTimeParts,
        })
      )
    }

    if (!emailFileSelected && !existingUpload) {
      errors.push(
        makeErrorObject({
          id: 'recallRequestEmailFileName',
          text: 'Select an email',
        })
      )
    }
    if (uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'recallRequestEmailFileName',
          text: 'The selected file could not be uploaded – try again',
          values: fileName,
        })
      )
    }
    if (!uploadFailed && invalidFileExtension) {
      errors.push(
        makeErrorObject({
          id: 'recallRequestEmailFileName',
          text: `The selected file must be an ${allowedEmailFileExtensions.join(' or ')}`,
          values: fileName,
        })
      )
    }
    unsavedValues = {
      recallEmailReceivedDateTimeParts,
    }
  }
  if (!errors) {
    valuesToSave = { recallEmailReceivedDateTime } as UpdateRecallRequest
  }
  return { errors, valuesToSave, unsavedValues }
}
