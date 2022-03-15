import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { ValidationError, FormWithDocumentUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { errorMsgUserActionDateTime, errorMsgEmailUpload, makeErrorObject } from '../../utils/errorMessages'
import { convertGmtDatePartsToUtc, dateHasError } from '../../utils/dates/convert'
import { isInvalidEmailFileName } from '../../documents/upload/helpers/allowedUploadExtensions'

export const validateRecallRequestReceived = ({
  requestBody,
  fileName,
  wasUploadFileReceived,
  uploadFailed,
}: FormWithDocumentUploadValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let valuesToSave
  const invalidFileName = isInvalidEmailFileName(fileName)
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
    (!wasUploadFileReceived && !existingUpload) ||
    uploadFailed ||
    invalidFileName ||
    dateHasError(recallEmailReceivedDateTime)
  ) {
    errors = []
    if (dateHasError(recallEmailReceivedDateTime)) {
      errors.push(
        makeErrorObject({
          name: 'recallEmailReceivedDateTime',
          id: 'recallEmailReceivedDateTime-recallEmailReceivedDateTimeDay',
          text: errorMsgUserActionDateTime(recallEmailReceivedDateTime as ValidationError, 'received the recall email'),
          values: recallEmailReceivedDateTimeParts,
        })
      )
    }

    if (!uploadFailed && !wasUploadFileReceived && !existingUpload) {
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
    if (!uploadFailed && invalidFileName) {
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
