import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { DateValidationError, EmailUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { errorMsgEmailUpload, errorMsgUserActionDateTime } from '../../helpers/errorMessages'
import { AddDocumentRequest } from '../../../../@types/manage-recalls-api/models/AddDocumentRequest'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates/convert'

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
  const existingUpload = requestBody[AddDocumentRequest.category.RECALL_NOTIFICATION_EMAIL] === 'existingUpload'
  if (
    (!emailFileSelected && !existingUpload) ||
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
          text: errorMsgEmailUpload.confirmSent,
        })
      )
    }
    if (confirmRecallNotificationEmailSent && dateHasError(recallNotificationEmailSentDateTime)) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailSentDateTime',
          text: errorMsgUserActionDateTime(
            recallNotificationEmailSentDateTime as DateValidationError,
            'sent the email'
          ),
          values: recallNotificationEmailSentDateTimeParts,
        })
      )
    }
    if (confirmRecallNotificationEmailSent && !emailFileSelected && !existingUpload) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailFileName',
          text: errorMsgEmailUpload.noFile,
        })
      )
    }
    if (confirmRecallNotificationEmailSent && uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailFileName',
          text: errorMsgEmailUpload.uploadFailed,
          values: fileName,
        })
      )
    }
    if (confirmRecallNotificationEmailSent && !uploadFailed && invalidFileFormat) {
      errors.push(
        makeErrorObject({
          id: 'recallNotificationEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat,
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
