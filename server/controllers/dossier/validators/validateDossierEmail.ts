import { ValidationError, FormWithDocumentUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import {
  allowedEmailFileExtensions,
  isInvalidEmailFileName,
} from '../../documents/upload/helpers/allowedUploadExtensions'
import { errorMsgEmailUpload, errorMsgUserActionDateTime, makeErrorObject } from '../../utils/errorMessages'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { convertGmtDatePartsToUtc, dateHasError } from '../../utils/dates/convert'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'

export const validateDossierEmail = ({
  requestBody,
  fileName,
  wasUploadFileReceived,
  uploadFailed,
  actionedByUserId,
}: FormWithDocumentUploadValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let valuesToSave
  const invalidFileName = isInvalidEmailFileName(fileName)
  const { confirmDossierEmailSent } = requestBody
  const dossierEmailSentDateParts = {
    year: requestBody.dossierEmailSentDateYear,
    month: requestBody.dossierEmailSentDateMonth,
    day: requestBody.dossierEmailSentDateDay,
  }
  const dossierEmailSentDate = convertGmtDatePartsToUtc(dossierEmailSentDateParts, { dateMustBeInPast: true })
  const existingUpload = requestBody[UploadDocumentRequest.category.DOSSIER_EMAIL] === 'existingUpload'
  if (
    (!wasUploadFileReceived && !existingUpload) ||
    uploadFailed ||
    invalidFileName ||
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
          id: 'dossierEmailSentDate-dossierEmailSentDateDay',
          text: errorMsgUserActionDateTime(dossierEmailSentDate as ValidationError, 'sent the email', true),
          values: dossierEmailSentDateParts,
        })
      )
    }
    if (confirmDossierEmailSent && !wasUploadFileReceived && !existingUpload) {
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
    if (confirmDossierEmailSent && !uploadFailed && invalidFileName) {
      errors.push(
        makeErrorObject({
          id: 'dossierEmailFileName',
          text: `The selected file must be an ${allowedEmailFileExtensions.map(ext => ext.label).join(' or ')}`,
        })
      )
    }
  }
  const unsavedValues = {
    dossierEmailFileName: fileName,
    confirmDossierEmailSent,
    dossierEmailSentDateParts,
  }
  if (!errors) {
    valuesToSave = { dossierEmailSentDate: dossierEmailSentDate as string, dossierCreatedByUserId: actionedByUserId }
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: 'dossier-confirmation' }
}
