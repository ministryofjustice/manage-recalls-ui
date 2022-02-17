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
  const returnToCustodyDateTimeParts = {
    year: requestBody.returnToCustodyDateTimeYear,
    month: requestBody.returnToCustodyDateTimeMonth,
    day: requestBody.returnToCustodyDateTimeDay,
    hour: requestBody.returnToCustodyDateTimeHour,
    minute: requestBody.returnToCustodyDateTimeMinute,
  }
  const returnToCustodyDateTime = convertGmtDatePartsToUtc(returnToCustodyDateTimeParts, {
    dateMustBeInPast: true,
    includeTime: true,
  })

  const returnToCustodyNotificationDateTimeParts = {
    year: requestBody.returnToCustodyNotificationDateTimeYear,
    month: requestBody.returnToCustodyNotificationDateTimeMonth,
    day: requestBody.returnToCustodyNotificationDateTimeDay,
    hour: requestBody.returnToCustodyNotificationDateTimeHour,
    minute: requestBody.returnToCustodyNotificationDateTimeMinute,
  }
  const returnToCustodyNotificationDateTime = convertGmtDatePartsToUtc(returnToCustodyNotificationDateTimeParts, {
    dateMustBeInPast: true,
    includeTime: true,
  })
  if (dateHasError(returnToCustodyDateTime) || dateHasError(returnToCustodyNotificationDateTime)) {
    errors = []
    if (dateHasError(returnToCustodyDateTime)) {
      errors.push(
        makeErrorObject({
          id: 'returnToCustodyDateTime',
          text: formatValidationErrorMessage(
            returnToCustodyDateTime as ValidationError,
            'date and time {{ recall.fullName }} returned to custody'
          ),
          values: returnToCustodyDateTimeParts,
        })
      )
    }
    if (dateHasError(returnToCustodyNotificationDateTime)) {
      errors.push(
        makeErrorObject({
          id: 'returnToCustodyNotificationDateTime',
          text: formatValidationErrorMessage(
            returnToCustodyNotificationDateTime as ValidationError,
            'date and time you found out {{ recall.fullName }} returned to custody'
          ),
          values: returnToCustodyNotificationDateTimeParts,
        })
      )
    }

    unsavedValues = {
      returnToCustodyDateTimeParts,
      returnToCustodyNotificationDateTimeParts,
    }
  }
  if (!errors) {
    valuesToSave = { returnToCustodyDateTime, returnToCustodyNotificationDateTime } as ReturnToCustodyDatesRequest
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: '/' }
}
