import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'
import { ValidationError, FormWithDocumentUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import {
  errorMsgDocumentUpload,
  errorMsgEmailUpload,
  errorMsgUserActionDateTime,
  makeErrorObject,
} from '../../utils/errorMessages'
import { convertGmtDatePartsToUtc, dateHasError } from '../../utils/dates/convert'
import { isInvalidFileType } from '../../documents/upload/helpers/allowedUploadExtensions'
import { isFileSizeTooLarge } from '../../documents/upload/helpers'

export const validateRecallNotificationEmail = ({
  requestBody,
  file,
  wasUploadFileReceived,
  uploadFailed,
  actionedByUserId,
}: FormWithDocumentUploadValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let valuesToSave

  const fileName = file?.originalname
  const invalidFileType = wasUploadFileReceived
    ? isInvalidFileType({ file, category: RecallDocument.category.RESCIND_DECISION_EMAIL })
    : false
  const fileSizeTooLarge = wasUploadFileReceived && isFileSizeTooLarge(file.size)
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
    (!wasUploadFileReceived && !existingUpload) ||
    uploadFailed ||
    invalidFileType ||
    fileSizeTooLarge ||
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
          name: 'recallNotificationEmailSentDateTime',
          id: 'recallNotificationEmailSentDateTime-recallNotificationEmailSentDateTimeDay',
          text: errorMsgUserActionDateTime(recallNotificationEmailSentDateTime as ValidationError, 'sent the email'),
          values: recallNotificationEmailSentDateTimeParts,
        })
      )
    }
    if (confirmRecallNotificationEmailSent && !wasUploadFileReceived && !existingUpload) {
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
    if (confirmRecallNotificationEmailSent && !uploadFailed) {
      if (invalidFileType) {
        errors.push(
          makeErrorObject({
            id: 'recallNotificationEmailFileName',
            text: errorMsgEmailUpload.invalidFileFormat(fileName),
          })
        )
      }
      if (fileSizeTooLarge) {
        errors.push(
          makeErrorObject({
            id: 'recallNotificationEmailFileName',
            text: errorMsgDocumentUpload.invalidFileSize(fileName),
          })
        )
      }
    }
  }
  const unsavedValues = {
    recallNotificationEmailFileName: fileName,
    confirmRecallNotificationEmailSent,
    recallNotificationEmailSentDateTimeParts,
  }
  if (!errors) {
    valuesToSave = { recallNotificationEmailSentDateTime, assessedByUserId: actionedByUserId } as UpdateRecallRequest
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: 'assess-confirmation' }
}
