import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { EmailUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../../@types'
import { convertGmtDatePartsToUtc, dateHasError } from '../../helpers/dates'
import { allowedEmailFileExtensions } from '../../helpers/allowedUploadExtensions'

export const validateDossierEmail = ({
  requestBody,
  fileName,
  emailFileSelected,
  uploadFailed,
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
    ? !allowedEmailFileExtensions.some((ext: string) => fileName.endsWith(ext))
    : false
  if (
    !emailFileSelected ||
    uploadFailed ||
    invalidFileExtension ||
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
          text: 'Enter the date you sent the email',
          values: dossierEmailSentDateParts,
        })
      )
    }
    if (confirmDossierEmailSent && !emailFileSelected) {
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
    if (confirmDossierEmailSent && !uploadFailed && invalidFileExtension) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailFileName',
          text: `The selected file must be an ${allowedEmailFileExtensions.join(' or ')}`,
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
