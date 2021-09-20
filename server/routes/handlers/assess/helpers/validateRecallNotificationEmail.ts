import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { EmailUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { convertGmtDatePartsToUtc } from '../../helpers/dates'

export const validateRecallNotificationEmail = ({
  requestBody,
  fileName,
  emailFileSelected,
  uploadFailed,
  allowedFileExtensions,
}: EmailUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave: UpdateRecallRequest
  unsavedValues: ObjectMap<unknown>
} => {
  let errors
  let unsavedValues
  let valuesToSave

  const { confirmRecallNotificationEmailSent } = requestBody
  const recallNotificationEmailSentDateTimeParts = {
    year: requestBody.recallNotificationEmailSentDateTimeYear,
    month: requestBody.recallNotificationEmailSentDateTimeMonth,
    day: requestBody.recallNotificationEmailSentDateTimeDay,
    hour: requestBody.recallNotificationEmailSentDateTimeHour,
    minute: requestBody.recallNotificationEmailSentDateTimeMinute,
  }
  const recallNotificationEmailSentDateTime = convertGmtDatePartsToUtc(recallNotificationEmailSentDateTimeParts, {
    dateMustBeInPast: true,
  })
  const invalidFileExtension = emailFileSelected
    ? !allowedFileExtensions.some((ext: string) => fileName.endsWith(ext))
    : false
  if (
    !emailFileSelected ||
    uploadFailed ||
    invalidFileExtension ||
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
          text: 'Date and time you sent the recall email',
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
    if (confirmRecallNotificationEmailSent && !uploadFailed && invalidFileExtension) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailFileName',
          text: `Only ${allowedFileExtensions.join(', ')} files are allowed`,
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
  if (!errors) {
    valuesToSave = { recallNotificationEmailSentDateTime }
  }
  return { errors, valuesToSave, unsavedValues }
}
