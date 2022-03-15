import {
  ConfirmationMessage,
  FormWithDocumentUploadValidatorArgs,
  NamedFormError,
  ObjectMap,
  ValidationError,
} from '../../../@types'
import {
  errorMsgEmailUpload,
  errorMsgProvideDetail,
  errorMsgUserActionDateTime,
  makeErrorObject,
} from '../../utils/errorMessages'
import { convertGmtDatePartsToUtc, dateHasError } from '../../utils/dates/convert'
import { isInvalidEmailFileName } from '../../documents/upload/helpers/allowedUploadExtensions'

export const validateRescindRequest = ({
  requestBody,
  wasUploadFileReceived,
  uploadFailed,
  fileName,
}: FormWithDocumentUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave?: { details: string; emailReceivedDate: string }
  unsavedValues: ObjectMap<unknown>
  confirmationMessage?: ConfirmationMessage
} => {
  let errors
  let valuesToSave
  let confirmationMessage
  const invalidFileName = isInvalidEmailFileName(fileName)
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
    !wasUploadFileReceived ||
    uploadFailed ||
    invalidFileName ||
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
          id: 'rescindRequestEmailReceivedDate-rescindRequestEmailReceivedDateDay',
          text: errorMsgUserActionDateTime(
            rescindRequestEmailReceivedDate as ValidationError,
            'received the rescind request email',
            true
          ),
          values: rescindRequestEmailReceivedDateParts,
        })
      )
    }
    if (!wasUploadFileReceived) {
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
    if (!uploadFailed && invalidFileName) {
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
    confirmationMessage = {
      text: 'Rescind request added.',
      link: {
        text: 'View',
        href: '#rescinds',
      },
      type: 'success',
    }
    valuesToSave = { details: rescindRequestDetail, emailReceivedDate: rescindRequestEmailReceivedDate as string }
  }
  return { errors, valuesToSave, unsavedValues, confirmationMessage }
}
