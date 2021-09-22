import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { EmailUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { convertGmtDatePartsToUtc } from '../../helpers/dates'

export const validateDossierEmail = ({
  requestBody,
  fileName,
  emailFileSelected,
  uploadFailed,
  allowedFileExtensions,
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
  const invalidFileExtension = emailFileSelected
    ? !allowedFileExtensions.some((ext: string) => fileName.endsWith(ext))
    : false
  if (!emailFileSelected || uploadFailed || invalidFileExtension || !confirmDossierEmailSent || !dossierEmailSentDate) {
    errors = []
    if (!confirmDossierEmailSent) {
      errors.push(
        makeErrorObject({
          id: 'confirmDossierEmailSent',
          text: 'Confirm you sent the email to all recipients',
        })
      )
    }
    if (confirmDossierEmailSent && !dossierEmailSentDate) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailSentDate',
          text: 'Date you sent the dossier email',
          values: dossierEmailSentDateParts,
        })
      )
    }
    if (confirmDossierEmailSent && !emailFileSelected) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailFileName',
          text: 'Upload the email',
        })
      )
    }
    if (confirmDossierEmailSent && uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailFileName',
          text: 'An error occurred uploading the email',
          values: fileName,
        })
      )
    }
    if (confirmDossierEmailSent && !uploadFailed && invalidFileExtension) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailFileName',
          text: `Only ${allowedFileExtensions.join(', ')} files are allowed`,
          values: fileName,
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
    valuesToSave = { dossierEmailSentDate, dossierCreatedByUserId: actionedByUserId }
  }
  return { errors, valuesToSave, unsavedValues }
}
