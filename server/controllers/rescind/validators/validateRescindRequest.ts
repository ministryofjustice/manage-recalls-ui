import { EmailUploadValidatorArgs, NamedFormError, ObjectMap, ValidationError } from '../../../@types'
import {
  errorMsgEmailUpload,
  errorMsgProvideDetail,
  errorMsgUserActionDateTime,
  makeErrorObject,
} from '../../utils/errorMessages'
import { convertGmtDatePartsToUtc, dateHasError } from '../../utils/dates/convert'

export const validateRescindRequest = ({
  requestBody,
  emailFileSelected,
  uploadFailed,
  invalidFileFormat,
}: EmailUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave?: { details: string; emailReceivedDate: string }
  unsavedValues: ObjectMap<unknown>
} => {
  let errors
  let valuesToSave
  const { rescindRequestDetail } = requestBody
  const rescindRequestEmailReceivedDateParts = {
    year: requestBody.rescindRequestEmailReceivedDateYear,
    month: requestBody.rescindRequestEmailReceivedDateMonth,
    day: requestBody.rescindRequestEmailReceivedDateDay,
  }
  const rescindRequestEmailReceivedDate = convertGmtDatePartsToUtc(rescindRequestEmailReceivedDateParts, {
    dateMustBeInPast: true,
    includeTime: false,
  })

  if (
    !emailFileSelected ||
    uploadFailed ||
    invalidFileFormat ||
    !rescindRequestDetail ||
    dateHasError(rescindRequestEmailReceivedDate)
  ) {
    errors = []
    if (!rescindRequestDetail) {
      errors.push(
        makeErrorObject({
          id: 'rescindRequestDetail',
          text: errorMsgProvideDetail,
        })
      )
    }
    if (dateHasError(rescindRequestEmailReceivedDate)) {
      errors.push(
        makeErrorObject({
          id: 'rescindRequestEmailReceivedDate',
          text: errorMsgUserActionDateTime(
            rescindRequestEmailReceivedDate as ValidationError,
            'received the rescind request email',
            true
          ),
          values: rescindRequestEmailReceivedDateParts,
        })
      )
    }
    if (!emailFileSelected) {
      errors.push(
        makeErrorObject({
          id: 'rescindRequestEmailFileName',
          text: errorMsgEmailUpload.noFile,
        })
      )
    }
    if (uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'rescindRequestEmailFileName',
          text: errorMsgEmailUpload.uploadFailed,
        })
      )
    }
    if (!uploadFailed && invalidFileFormat) {
      errors.push(
        makeErrorObject({
          id: 'rescindRequestEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat,
        })
      )
    }
  }
  const unsavedValues = {
    rescindRequestDetail,
    rescindRequestEmailReceivedDateParts,
  }
  if (!errors) {
    valuesToSave = { details: rescindRequestDetail, emailReceivedDate: rescindRequestEmailReceivedDate as string }
  }
  return { errors, valuesToSave, unsavedValues }
}
