import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { DateValidationError, EmailUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { allowedEmailFileExtensions } from '../../helpers/allowedUploadExtensions'
import { errorMsgUserActionDateTime } from '../../helpers/errorMessages'
import { AddDocumentRequest } from '../../../../@types/manage-recalls-api/models/AddDocumentRequest'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates/convert'

export const validateDossierEmail = ({
  requestBody,
  fileName,
  emailFileSelected,
  uploadFailed,
  invalidFileFormat,
  actionedByUserId,
}: EmailUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave: UpdateRecallRequest
  unsavedValues: ObjectMap<unknown>
} => {
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
  const existingUpload = requestBody[AddDocumentRequest.category.DOSSIER_EMAIL] === 'existingUpload'
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
          text: "Confirm you've sent the email to all recipients",
        })
      )
    }
    if (confirmDossierEmailSent && dateHasError(dossierEmailSentDate)) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailSentDate',
          text: errorMsgUserActionDateTime(dossierEmailSentDate as DateValidationError, 'sent the email', true),
          values: dossierEmailSentDateParts,
        })
      )
    }
    if (confirmDossierEmailSent && !emailFileSelected && !existingUpload) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailFileName',
          text: 'Select an email',
        })
      )
    }
    if (confirmDossierEmailSent && uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailFileName',
          text: 'The selected file could not be uploaded – try again',
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
  return { errors, valuesToSave, unsavedValues }
}
