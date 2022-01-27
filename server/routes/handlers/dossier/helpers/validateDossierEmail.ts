import { makeErrorObject } from '../../helpers'
import { ValidationError, EmailUploadValidatorArgs, ReqValidatorReturn } from '../../../../@types'
import { allowedEmailFileExtensions } from '../../documents/upload/helpers/allowedUploadExtensions'
import { errorMsgEmailUpload, errorMsgUserActionDateTime } from '../../helpers/errorMessages'
import { UploadDocumentRequest } from '../../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates/convert'

export const validateDossierEmail = ({
  requestBody,
  fileName,
  emailFileSelected,
  uploadFailed,
  invalidFileFormat,
  actionedByUserId,
}: EmailUploadValidatorArgs): ReqValidatorReturn => {
  let errors
  let unsavedValues
  let valuesToSave

  const { confirmDossierEmailSent } = requestBody
  const dossierEmailSentDateParts = {
    year: requestBody.dossierEmailSentDateYear,
    month: requestBody.dossierEmailSentDateMonth,
    day: requestBody.dossierEmailSentDateDay,
  }
  const dossierEmailSentDate = convertGmtDatePartsToUtc(dossierEmailSentDateParts, { dateMustBeInPast: true })
  const existingUpload = requestBody[UploadDocumentRequest.category.DOSSIER_EMAIL] === 'existingUpload'
  if (
    (!emailFileSelected && !existingUpload) ||
    uploadFailed ||
    invalidFileFormat ||
    !confirmDossierEmailSent ||
    dateHasError(dossierEmailSentDate)
  ) {
    errors = []
    if (!confirmDossierEmailSent) {
      errors.push(
        makeErrorObject({
          id: 'confirmDossierEmailSent',
          text: errorMsgEmailUpload.confirmSent,
        })
      )
    }
    if (confirmDossierEmailSent && dateHasError(dossierEmailSentDate)) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailSentDate',
          text: errorMsgUserActionDateTime(dossierEmailSentDate as ValidationError, 'sent the email', true),
          values: dossierEmailSentDateParts,
        })
      )
    }
    if (confirmDossierEmailSent && !emailFileSelected && !existingUpload) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailFileName',
          text: errorMsgEmailUpload.noFile,
        })
      )
    }
    if (confirmDossierEmailSent && uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailFileName',
          text: errorMsgEmailUpload.uploadFailed,
        })
      )
    }
    if (confirmDossierEmailSent && !uploadFailed && invalidFileFormat) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailFileName',
          text: `The selected file must be an ${allowedEmailFileExtensions.map(ext => ext.label).join(' or ')}`,
        })
      )
    }
    unsavedValues = {
      dossierEmailFileName: fileName,
      confirmDossierEmailSent,
      dossierEmailSentDateParts,
    }
  }
  if (!errors) {
    valuesToSave = { dossierEmailSentDate: dossierEmailSentDate as string, dossierCreatedByUserId: actionedByUserId }
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: 'dossier-confirmation' }
}
