import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { convertGmtDatePartsToUtc } from '../../helpers/dates'

interface Args {
  requestBody: ObjectMap<string>
  fileName: string
  emailFileSelected: boolean
  uploadFailed: boolean
}
export const validateEmail = ({
  requestBody,
  fileName,
  emailFileSelected,
  uploadFailed,
}: Args): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest; unsavedValues: ObjectMap<unknown> } => {
  let errors
  let unsavedValues

  const { confirmRecallNotificationEmailSent } = requestBody
  const recallNotificationEmailSentDateTimeParts = {
    year: requestBody.recallNotificationEmailSentDateTimeYear,
    month: requestBody.recallNotificationEmailSentDateTimeMonth,
    day: requestBody.recallNotificationEmailSentDateTimeDay,
    hour: requestBody.recallNotificationEmailSentDateTimeHour,
    minute: requestBody.recallNotificationEmailSentDateTimeMinute,
  }
  const recallNotificationEmailSentDateTime = convertGmtDatePartsToUtc(recallNotificationEmailSentDateTimeParts)
  if (
    !emailFileSelected ||
    uploadFailed ||
    !confirmRecallNotificationEmailSent ||
    !recallNotificationEmailSentDateTime
  ) {
    errors = []
    if (!confirmRecallNotificationEmailSent) {
      errors.push(
        makeErrorObject({
          id: 'confirmRecallNotificationEmailSent',
          text: 'Confirm you sent the email to all recipients',
        })
      )
    }
    if (confirmRecallNotificationEmailSent && !recallNotificationEmailSentDateTime) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailSentDateTime',
          text: 'Date and time you received the recall email',
          values: recallNotificationEmailSentDateTimeParts,
        })
      )
    }
    if (confirmRecallNotificationEmailSent && !emailFileSelected) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailFileName',
          text: 'Upload the email',
        })
      )
    }
    if (confirmRecallNotificationEmailSent && uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailFileName',
          text: 'An error occurred uploading the email',
          values: fileName,
        })
      )
    }
    unsavedValues = {
      recallNotificationEmailFileName: fileName,
      confirmRecallNotificationEmailSent,
      recallNotificationEmailSentDateTimeParts,
    }
  }
  const valuesToSave = { recallNotificationEmailSentDateTime }
  return { errors, valuesToSave, unsavedValues }
}
