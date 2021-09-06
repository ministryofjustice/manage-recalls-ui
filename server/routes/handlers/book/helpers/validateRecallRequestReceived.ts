import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { convertGmtDatePartsToUtc } from '../../helpers/dates'

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
  const recallEmailReceivedDateTime = convertGmtDatePartsToUtc(recallEmailReceivedDateTimeParts)
  if (!recallEmailReceivedDateTime) {
    errors = [
      makeErrorObject({
        id: 'recallEmailReceivedDateTime',
        text: 'Date and time you received the recall email',
        values: recallEmailReceivedDateTimeParts,
      }),
    ]
    unsavedValues = {
      recallEmailReceivedDateTimeParts,
    }
  }
  if (!errors) {
    valuesToSave = { recallEmailReceivedDateTime }
  }
  return { errors, valuesToSave, unsavedValues }
}
