import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { AddDocumentRequest } from '../../../../@types/manage-recalls-api/models/AddDocumentRequest'
import { DateValidationError, EmailUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates'
import { errorMsgUserActionDateTime, errorMsgEmailUpload } from '../../helpers/errorMessages'

export const validateRecallRequestReceived = ({
  requestBody,
  emailFileSelected,
  uploadFailed,
  invalidFileFormat,
}: EmailUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave: UpdateRecallRequest
  unsavedValues: ObjectMap<unknown>
} => {
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
  const recallEmailReceivedDateTime = convertGmtDatePartsToUtc(recallEmailReceivedDateTimeParts, {
    dateMustBeInPast: true,
    includeTime: true,
  })

  const existingUpload = requestBody[AddDocumentRequest.category.RECALL_REQUEST_EMAIL] === 'existingUpload'
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
          text: errorMsgUserActionDateTime(
            recallEmailReceivedDateTime as DateValidationError,
            'received the recall email'
          ),
          values: recallEmailReceivedDateTimeParts,
        })
      )
    }

    if (!emailFileSelected && !existingUpload) {
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
    unsavedValues = {
      recallEmailReceivedDateTimeParts,
    }
  }
  if (!errors) {
    valuesToSave = { recallEmailReceivedDateTime } as UpdateRecallRequest
  }
  return { errors, valuesToSave, unsavedValues }
}
