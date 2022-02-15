import { makeErrorObject } from '../../helpers'
import { EmailUploadValidatorArgs, NamedFormError, ObjectMap, ValidationError } from '../../../../@types'
import { errorMsgEmailUpload, errorMsgProvideDetail, errorMsgUserActionDateTime } from '../../helpers/errorMessages'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates/convert'

export interface RescindDecisionValuesToSave {
  approved: boolean
  details: string
  emailSentDate: string
}

export const validateRescindDecision = ({
  requestBody,
  emailFileSelected,
  uploadFailed,
  invalidFileFormat,
}: EmailUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave?: RescindDecisionValuesToSave
  unsavedValues: ObjectMap<unknown>
} => {
  let errors
  let valuesToSave
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
    !emailFileSelected ||
    uploadFailed ||
    invalidFileFormat ||
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
          id: 'rescindDecisionEmailSentDate',
          text: errorMsgUserActionDateTime(
            rescindDecisionEmailSentDate as ValidationError,
            'sent the rescind decision email',
            true
          ),
          values: rescindDecisionEmailSentDateParts,
        })
      )
    }
    if (confirmEmailSent && !emailFileSelected) {
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
    if (confirmEmailSent && !uploadFailed && invalidFileFormat) {
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
      approved: approveRescindDecision === 'YES',
      details: rescindDecisionDetail,
      emailSentDate: rescindDecisionEmailSentDate as string,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
