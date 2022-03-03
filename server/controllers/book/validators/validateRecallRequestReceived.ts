import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { ValidationError, EmailUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { errorMsgUserActionDateTime, errorMsgEmailUpload, makeErrorObject } from '../../utils/errorMessages'
import { convertGmtDatePartsToUtc, dateHasError } from '../../utils/dates/convert'

export const validateRecallRequestReceived = ({
  requestBody,
  emailFileSelected,
  uploadFailed,
  invalidFileFormat,
}: EmailUploadValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
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

  const existingUpload = requestBody[UploadDocumentRequest.category.RECALL_REQUEST_EMAIL] === 'existingUpload'
  if (
    (!emailFileSelected && !existingUpload) ||
    uploadFailed ||
    invalidFileFormat ||
    dateHasError(recallEmailReceivedDateTime)
  ) {
    errors = []
    if (dateHasError(recallEmailReceivedDateTime)) {
      errors.push(
        makeErrorObject({
          id: 'recallEmailReceivedDateTime',
          text: errorMsgUserActionDateTime(recallEmailReceivedDateTime as ValidationError, 'received the recall email'),
          values: recallEmailReceivedDateTimeParts,
        })
      )
    }

    if (!uploadFailed && !emailFileSelected && !existingUpload) {
      errors.push(
        makeErrorObject({
          id: 'recallRequestEmailFileName',
          text: errorMsgEmailUpload.noFile,
        })
      )
    }
    if (uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'recallRequestEmailFileName',
          text: errorMsgEmailUpload.uploadFailed,
        })
      )
    }
    if (!uploadFailed && invalidFileFormat) {
      errors.push(
        makeErrorObject({
          id: 'recallRequestEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat,
        })
      )
    }
  }
  const unsavedValues = {
    recallEmailReceivedDateTimeParts,
  }
  if (!errors) {
    valuesToSave = { recallEmailReceivedDateTime } as UpdateRecallRequest
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: 'last-release' }
}
