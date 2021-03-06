import {
  ConfirmationMessage,
  FormWithDocumentUploadValidatorArgs,
  NamedFormError,
  ObjectMap,
  ValidationError,
} from '../../../@types'
import {
  errorMsgDocumentUpload,
  errorMsgEmailUpload,
  errorMsgProvideDetail,
  errorMsgUserActionDateTime,
  makeErrorObject,
} from '../../utils/errorMessages'
import { convertGmtDatePartsToUtc, dateHasError } from '../../utils/dates/convert'
import { isInvalidFileType } from '../../documents/upload/helpers/allowedUploadExtensions'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'
import { isFileSizeTooLarge } from '../../documents/upload/helpers'

export const validateRescindRequest = ({
  requestBody,
  wasUploadFileReceived,
  uploadFailed,
  file,
}: FormWithDocumentUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave?: { details: string; emailReceivedDate: string }
  unsavedValues: ObjectMap<unknown>
  confirmationMessage?: ConfirmationMessage
} => {
  let errors
  let valuesToSave
  let confirmationMessage

  const fileName = file?.originalname
  const invalidFileType = wasUploadFileReceived
    ? isInvalidFileType({ file, category: RecallDocument.category.RESCIND_REQUEST_EMAIL })
    : false
  const fileSizeTooLarge = wasUploadFileReceived && isFileSizeTooLarge(file.size)

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
    invalidFileType ||
    fileSizeTooLarge ||
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
          name: 'rescindRequestEmailReceivedDate',
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
    if (!uploadFailed && invalidFileType) {
      errors.push(
        makeErrorObject({
          id: 'rescindRequestEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat(fileName),
        })
      )
    }
    if (!uploadFailed && fileSizeTooLarge) {
      errors.push(
        makeErrorObject({
          id: 'rescindRequestEmailFileName',
          text: errorMsgDocumentUpload.invalidFileSize(fileName),
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
