import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { DateValidationError, NamedFormError, ObjectMap } from '../../../../@types'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates'

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

export const validateRecallRequestReceived = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest; unsavedValues: ObjectMap<unknown> } => {
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
  if (dateHasError(recallEmailReceivedDateTime)) {
    errors = [
      makeErrorObject({
        id: 'recallEmailReceivedDateTime',
        text: makeErrorMessage(recallEmailReceivedDateTime as DateValidationError),
        values: recallEmailReceivedDateTimeParts,
      }),
    ]
    unsavedValues = {
      recallEmailReceivedDateTimeParts,
    }
  }
  if (!errors) {
    valuesToSave = { recallEmailReceivedDateTime } as UpdateRecallRequest
  }
  return { errors, valuesToSave, unsavedValues }
}
