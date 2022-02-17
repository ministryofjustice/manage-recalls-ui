import { makeErrorObject } from '../../helpers'
import { ValidationError, ReqValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { formatValidationErrorMessage } from '../../helpers/errorMessages'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates/convert'
import { ReturnToCustodyDatesRequest } from '../../../../@types/manage-recalls-api/models/ReturnToCustodyDatesRequest'

export const validateReturnToCustodyDates = ({
  requestBody,
}: ReqValidatorArgs): {
  errors: NamedFormError[]
  valuesToSave: ReturnToCustodyDatesRequest
  unsavedValues: ObjectMap<unknown>
  redirectToPage: string
} => {
  let errors
  let unsavedValues
  let valuesToSave
  const returnedToCustodyDateTimeParts = {
    year: requestBody.returnedToCustodyDateTimeYear,
    month: requestBody.returnedToCustodyDateTimeMonth,
    day: requestBody.returnedToCustodyDateTimeDay,
    hour: requestBody.returnedToCustodyDateTimeHour,
    minute: requestBody.returnedToCustodyDateTimeMinute,
  }
  const returnedToCustodyDateTime = convertGmtDatePartsToUtc(returnedToCustodyDateTimeParts, {
    dateMustBeInPast: true,
    includeTime: true,
  })

  const returnedToCustodyNotificationDateTimeParts = {
    year: requestBody.returnedToCustodyNotificationDateTimeYear,
    month: requestBody.returnedToCustodyNotificationDateTimeMonth,
    day: requestBody.returnedToCustodyNotificationDateTimeDay,
    hour: requestBody.returnedToCustodyNotificationDateTimeHour,
    minute: requestBody.returnedToCustodyNotificationDateTimeMinute,
  }
  const returnedToCustodyNotificationDateTime = convertGmtDatePartsToUtc(returnedToCustodyNotificationDateTimeParts, {
    dateMustBeInPast: true,
    includeTime: true,
  })
  if (dateHasError(returnedToCustodyDateTime) || dateHasError(returnedToCustodyNotificationDateTime)) {
    errors = []
    if (dateHasError(returnedToCustodyDateTime)) {
      errors.push(
        makeErrorObject({
          id: 'returnedToCustodyDateTime',
          text: formatValidationErrorMessage(
            returnedToCustodyDateTime as ValidationError,
            'date and time {{ recall.fullName }} returned to custody'
          ),
          values: returnedToCustodyDateTimeParts,
        })
      )
    }
    if (dateHasError(returnedToCustodyNotificationDateTime)) {
      errors.push(
        makeErrorObject({
          id: 'returnedToCustodyNotificationDateTime',
          text: formatValidationErrorMessage(
            returnedToCustodyNotificationDateTime as ValidationError,
            'date and time you found out {{ recall.fullName }} returned to custody'
          ),
          values: returnedToCustodyNotificationDateTimeParts,
        })
      )
    }

    unsavedValues = {
      returnedToCustodyDateTimeParts,
      returnedToCustodyNotificationDateTimeParts,
    }
  }
  if (!errors) {
    valuesToSave = { returnedToCustodyDateTime, returnedToCustodyNotificationDateTime } as ReturnToCustodyDatesRequest
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: '/' }
}
