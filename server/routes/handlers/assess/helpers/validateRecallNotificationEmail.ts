import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { EmailUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates'
import { allowedEmailFileExtensions } from '../../helpers/allowedUploadExtensions'

export const validateRecallNotificationEmail = ({
  requestBody,
  fileName,
  emailFileSelected,
  uploadFailed,
  invalidFileFormat,
  actionedByUserId,
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
    includeTime: true,
  })

  if (
    !emailFileSelected ||
    uploadFailed ||
    invalidFileFormat ||
    !confirmRecallNotificationEmailSent ||
    dateHasError(recallNotificationEmailSentDateTime)
  ) {
    errors = []
    if (!confirmRecallNotificationEmailSent) {
      errors.push(
        makeErrorObject({
          id: 'confirmRecallNotificationEmailSent',
          text: "Confirm you've sent the email to all recipients",
        })
      )
    }
    if (confirmRecallNotificationEmailSent && dateHasError(recallNotificationEmailSentDateTime)) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailSentDateTime',
          text: 'Enter the date and time you sent the email',
          values: recallNotificationEmailSentDateTimeParts,
        })
      )
    }
    if (confirmRecallNotificationEmailSent && !emailFileSelected) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailFileName',
          text: 'Select an email',
        })
      )
    }
    if (confirmRecallNotificationEmailSent && uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailFileName',
          text: 'The selected file could not be uploaded – try again',
          values: fileName,
        })
      )
    }
    if (confirmRecallNotificationEmailSent && !uploadFailed && invalidFileFormat) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailFileName',
          text: `The selected file must be an ${allowedEmailFileExtensions.map(ext => ext.label).join(' or ')}`,
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
    valuesToSave = { recallNotificationEmailSentDateTime, assessedByUserId: actionedByUserId } as UpdateRecallRequest
  }
  return { errors, valuesToSave, unsavedValues }
}
