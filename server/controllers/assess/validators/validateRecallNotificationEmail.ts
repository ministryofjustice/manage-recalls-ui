import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { ValidationError, EmailUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { errorMsgEmailUpload, errorMsgUserActionDateTime, makeErrorObject } from '../../utils/errorMessages'
import { convertGmtDatePartsToUtc, dateHasError } from '../../utils/dates/convert'

export const validateRecallNotificationEmail = ({
  requestBody,
  fileName,
  emailFileSelected,
  uploadFailed,
  invalidFileFormat,
  actionedByUserId,
}: EmailUploadValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
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
  const existingUpload = requestBody[UploadDocumentRequest.category.RECALL_NOTIFICATION_EMAIL] === 'existingUpload'
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
          text: errorMsgUserActionDateTime(recallNotificationEmailSentDateTime as ValidationError, 'sent the email'),
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
  return { errors, valuesToSave, unsavedValues, redirectToPage: 'assess-confirmation' }
}
