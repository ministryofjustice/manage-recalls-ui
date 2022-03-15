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

export interface RescindDecisionValuesToSave {
  approved: boolean
  details: string
  emailSentDate: string
  rescindRecordId: string
}

export const validateRescindDecision = ({
  requestBody,
  wasUploadFileReceived,
  uploadFailed,
  fileName,
}: FormWithDocumentUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave?: RescindDecisionValuesToSave
  unsavedValues: ObjectMap<unknown>
  confirmationMessage?: ConfirmationMessage
} => {
  let errors
  let valuesToSave
  let confirmationMessage
  const invalidFileName = isInvalidEmailFileName(fileName)
  const { approveRescindDecision, rescindDecisionDetail, confirmEmailSent } = requestBody
  const rescindDecisionEmailSentDateParts = {
    year: requestBody.rescindDecisionEmailSentDateYear,
    month: requestBody.rescindDecisionEmailSentDateMonth,
    day: requestBody.rescindDecisionEmailSentDateDay,
  }
  const rescindDecisionEmailSentDate = convertGmtDatePartsToUtc(rescindDecisionEmailSentDateParts, {
    dateMustBeInPast: true,
    includeTime: false,
  })

  if (
    !approveRescindDecision ||
    !wasUploadFileReceived ||
    uploadFailed ||
    invalidFileName ||
    !rescindDecisionDetail ||
    !confirmEmailSent ||
    dateHasError(rescindDecisionEmailSentDate)
  ) {
    errors = []
    if (!approveRescindDecision) {
      errors.push(
        makeErrorObject({
          id: 'approveRescindDecision',
          text: 'Do you want to rescind this recall?',
        })
      )
    }
    if (!rescindDecisionDetail) {
      errors.push(
        makeErrorObject({
          id: 'rescindDecisionDetail',
          text: errorMsgProvideDetail,
        })
      )
    }
    if (!confirmEmailSent) {
      errors.push(
        makeErrorObject({
          id: 'confirmEmailSent',
          text: errorMsgEmailUpload.confirmSent,
        })
      )
    }
    if (confirmEmailSent && dateHasError(rescindDecisionEmailSentDate)) {
      errors.push(
        makeErrorObject({
          id: 'rescindDecisionEmailSentDate-rescindDecisionEmailSentDateDay',
          text: errorMsgUserActionDateTime(
            rescindDecisionEmailSentDate as ValidationError,
            'sent the rescind decision email',
            true
          ),
          values: rescindDecisionEmailSentDateParts,
        })
      )
    }
    if (confirmEmailSent && !wasUploadFileReceived) {
      errors.push(
        makeErrorObject({
          id: 'rescindDecisionEmailFileName',
          text: errorMsgEmailUpload.noFile,
        })
      )
    }
    if (confirmEmailSent && uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'rescindDecisionEmailFileName',
          text: errorMsgEmailUpload.uploadFailed,
        })
      )
    }
    if (confirmEmailSent && !uploadFailed && invalidFileName) {
      errors.push(
        makeErrorObject({
          id: 'rescindDecisionEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat,
        })
      )
    }
  }
  const unsavedValues = {
    approveRescindDecision,
    rescindDecisionDetail,
    confirmEmailSent,
    rescindDecisionEmailSentDateParts,
  }
  if (!errors) {
    valuesToSave = {
      rescindRecordId: requestBody.rescindRecordId,
      approved: approveRescindDecision === 'YES',
      details: rescindDecisionDetail,
      emailSentDate: rescindDecisionEmailSentDate as string,
    }
    confirmationMessage = {
      text: valuesToSave.approved ? 'Recall rescinded.' : 'Rescind not approved.',
      link: {
        text: 'View',
        href: '#rescinds',
      },
      type: 'success',
    }
  }
  return { errors, valuesToSave, unsavedValues, confirmationMessage }
}
