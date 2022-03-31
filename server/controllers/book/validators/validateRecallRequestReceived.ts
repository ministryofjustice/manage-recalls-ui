import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { ValidationError, FormWithDocumentUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import {
  errorMsgUserActionDateTime,
  errorMsgEmailUpload,
  makeErrorObject,
  errorMsgDocumentUpload,
} from '../../utils/errorMessages'
import { convertGmtDatePartsToUtc, dateHasError } from '../../utils/dates/convert'
import { isInvalidFileType } from '../../documents/upload/helpers/allowedUploadExtensions'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'
import { isFileSizeTooLarge } from '../../documents/upload/helpers'

export const validateRecallRequestReceived = ({
  requestBody,
  file,
  wasUploadFileReceived,
  uploadFailed,
}: FormWithDocumentUploadValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let valuesToSave

  const fileName = file?.originalname
  const invalidFileType = wasUploadFileReceived
    ? isInvalidFileType({ file, category: RecallDocument.category.RESCIND_DECISION_EMAIL })
    : false
  const fileSizeTooLarge = wasUploadFileReceived && isFileSizeTooLarge(file.size)
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
    invalidFileType ||
    fileSizeTooLarge ||
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
    if (!uploadFailed && invalidFileType) {
      errors.push(
        makeErrorObject({
          id: 'recallRequestEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat(fileName),
        })
      )
    }
    if (!uploadFailed && fileSizeTooLarge) {
      errors.push(
        makeErrorObject({
          id: 'recallRequestEmailFileName',
          text: errorMsgDocumentUpload.invalidFileSize(fileName),
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
