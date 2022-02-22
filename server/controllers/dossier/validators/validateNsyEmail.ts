import { EmailUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { allowedEmailFileExtensions } from '../../documents/upload/helpers/allowedUploadExtensions'
import { errorMsgEmailUpload, makeErrorObject } from '../../utils/errorMessages'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'

export const validateNsyEmail = ({
  requestBody,
  fileName,
  emailFileSelected,
  uploadFailed,
  invalidFileFormat,
}: EmailUploadValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let unsavedValues

  const { confirmNsyEmailSent } = requestBody
  const existingUpload = requestBody[UploadDocumentRequest.category.NSY_REMOVE_WARRANT_EMAIL] === 'existingUpload'
  if ((!emailFileSelected && !existingUpload) || uploadFailed || invalidFileFormat || !confirmNsyEmailSent) {
    errors = []
    if (!confirmNsyEmailSent) {
      errors.push(
        makeErrorObject({
          id: 'confirmNsyEmailSent',
          text: errorMsgEmailUpload.confirmSent,
        })
      )
    }
    if (confirmNsyEmailSent && !emailFileSelected && !existingUpload) {
      errors.push(
        makeErrorObject({
          id: 'nsyEmailFileName',
          text: errorMsgEmailUpload.noFile,
        })
      )
    }
    if (confirmNsyEmailSent && uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'nsyEmailFileName',
          text: errorMsgEmailUpload.uploadFailed,
        })
      )
    }
    if (confirmNsyEmailSent && !uploadFailed && invalidFileFormat) {
      errors.push(
        makeErrorObject({
          id: 'nsyEmailFileName',
          text: `The selected file must be an ${allowedEmailFileExtensions.map(ext => ext.label).join(' or ')}`,
        })
      )
    }
    unsavedValues = {
      nsyEmailFileName: fileName,
      confirmNsyEmailSent,
    }
  }
  return { errors, unsavedValues, redirectToPage: 'dossier-letter' }
}
